import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import rehypeStringify from "rehype-stringify"
import { toHtml } from "hast-util-to-html"
import { getAllCategoryConfigs } from "./category"
import { sortSidebarItems, sortSidebarGroups, buildSidebarStructure, type SidebarGroup } from "./sidebar-utils"
import { sanitizePath, validatePathWithinDirectory, validateMDXSecurity } from "./mdx-security"
import { getConfig } from "./config"
import type { I18nConfig } from "./config.types"

const DOCS_DIR = path.join(process.cwd(), "docs")

/**
 * Structured node type for MDX content rendering.
 * Used to pass a JSON-serializable tree from server to client,
 * allowing the client-side recursive renderer to instantiate
 * real Svelte components for custom tags.
 */
export interface MdxNode {
  type: 'html' | 'component'
  content?: string
  name?: string
  props?: Record<string, any>
  children?: MdxNode[]
}

/**
 * Map of lowercased HTML tag names to PascalCase component names.
 * When rehype processes MDX, it lowercases all custom tags.
 * This map restores the correct component name for rendering.
 */
const COMPONENT_TAG_MAP: Record<string, string> = {
  accordion: 'Accordion',
  accordionitem: 'AccordionItem',
  tabs: 'Tabs',
  tab: 'Tab',
  callout: 'Callout',
  card: 'Card',
  cardgrid: 'CardGrid',
  imagecard: 'ImageCard',
  imagecardgrid: 'ImageCardGrid',
  steps: 'Steps',
  step: 'Step',
  icon: 'Icon',
  mermaid: 'Mermaid',
  math: 'Math',
  columns: 'Columns',
  column: 'Column',
  docbadge: 'DocBadge',
  badge: 'Badge',
  tooltip: 'Tooltip',
  frame: 'Frame',
  codeblock: 'CodeBlock',
  image: 'Image',
  video: 'Video',
  apiendpoint: 'ApiEndpoint',
  apiparams: 'ApiParams',
  apiresponse: 'ApiResponse',
  apiplayground: 'ApiPlayground',
  apireference: 'ApiReference',
}

/**
 * Map of lowercased attribute names to their correct camelCase form.
 * HTML lowercases all attribute names, so we need to restore them.
 */
const PROP_NAME_MAP: Record<string, string> = {
  defaultopen: 'defaultOpen',
  defaultvalue: 'defaultValue',
  classname: 'className',
  tabgroup: 'tabGroup',
  defaultchecked: 'defaultChecked',
  defaultselected: 'defaultSelected',
  apikey: 'apiKey',
  baseurl: 'baseURL',
}

/**
 * Pre-process markdown to convert JSX expression attributes into
 * HTML-safe string attributes before the remark/rehype pipeline.
 *
 * JSX expressions like `cols={{ sm: 1, md: 2 }}` and `span={2}` are
 * not valid HTML and get mangled by the HTML parser. This converts them
 * to quoted string attributes that survive parsing, using a special
 * `__jsx:` prefix so `convertProps` can parse them back.
 *
 * Examples:
 *   cols={{ sm: 1, md: 2 }}  →  cols="__jsx:{ sm: 1, md: 2 }"
 *   span={2}                  →  span="__jsx:2"
 *   variant="success"         →  (unchanged, already a string)
 */
function preprocessJsxExpressions(markdown: string): string {
  // Split markdown into fenced code blocks and non-code segments.
  // Only process JSX expressions in non-code segments to avoid corrupting code examples.
  // Matches ```` ``` ```` or ```` ```` ```` fenced blocks (3+ backticks or tildes).
  const fencedCodeRegex = /(^|\n)((`{3,}|~{3,}).*\n[\s\S]*?\n\3\s*(?:\n|$))/g
  const segments: Array<{ text: string; isCode: boolean }> = []
  let lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = fencedCodeRegex.exec(markdown)) !== null) {
    const codeStart = match.index + (match[1]?.length || 0)
    // Add the non-code segment before this code block
    if (codeStart > lastIndex) {
      segments.push({ text: markdown.slice(lastIndex, codeStart), isCode: false })
    }
    // Add the code block as-is
    segments.push({ text: match[2], isCode: true })
    lastIndex = match.index + match[0].length
  }
  // Add remaining non-code segment
  if (lastIndex < markdown.length) {
    segments.push({ text: markdown.slice(lastIndex), isCode: false })
  }

  // Build a pattern that matches known component tag names (case-insensitive for safety)
  const allNames = [...new Set([
    ...Object.values(COMPONENT_TAG_MAP),
    ...Object.keys(COMPONENT_TAG_MAP),
  ])].join('|')

  // Match opening tags of known components with their attributes
  // This regex finds `<ComponentName` followed by attributes until `>` or `/>`
  const tagRegex = new RegExp(
    `(<(?:${allNames}))(\\s[^>]*?)(\\/?>)`,
    'gi'
  )

  // Only process non-code segments
  return segments.map(({ text, isCode }) => {
    if (isCode) return text

    return text.replace(tagRegex, (_match, tagOpen, attrs, tagClose) => {
      // Manually scan the attributes string to find and replace JSX expression
      // attributes (name={...}), properly consuming the full balanced-brace expression.
      let result = ''
      let pos = 0

      while (pos < attrs.length) {
        // Try to match `name={` at the current position
        const attrMatch = attrs.slice(pos).match(/^(\w+)=\{/)
        if (attrMatch) {
          const attrName = attrMatch[1]
          const braceStart = pos + attrMatch[0].length

          // Find the matching closing brace, handling nesting
          let depth = 1
          let i = braceStart
          for (; i < attrs.length && depth > 0; i++) {
            if (attrs[i] === '{') depth++
            else if (attrs[i] === '}') depth--
          }

          if (depth === 0) {
            // Extract the expression (between the outer braces)
            const expression = attrs.slice(braceStart, i - 1)
            const escaped = expression.replace(/"/g, '&quot;')
            result += `${attrName}="__jsx:${escaped}"`
            pos = i // advance past the closing brace
          } else {
            // Unbalanced braces, emit as-is and advance one char
            result += attrs[pos]
            pos++
          }
        } else {
          result += attrs[pos]
          pos++
        }
      }

      return `${tagOpen}${result}${tagClose}`
    })
  }).join('')
}

/**
 * Parse a JSX expression string into a JavaScript value.
 * Handles objects like `{ sm: 1, md: 2 }`, numbers, booleans, and strings.
 */
function parseJsxExpression(expr: string): any {
  const trimmed = expr.trim()

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }

  // Boolean
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  // null/undefined
  if (trimmed === 'null') return null
  if (trimmed === 'undefined') return undefined

  // String literal (quoted)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }

  // Object literal like { sm: 1, md: 2 }
  // Convert JS object syntax to JSON: add quotes around keys
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      // Try direct JSON parse first
      return JSON.parse(trimmed)
    } catch {
      // Convert JS object notation to JSON: { sm: 1, md: 2 } → {"sm": 1, "md": 2}
      const jsonStr = trimmed.replace(
        /(\w+)\s*:/g,
        '"$1":'
      ).replace(
        /:\s*'([^']*)'/g,
        ': "$1"'
      )
      try {
        return JSON.parse(jsonStr)
      } catch {
        return trimmed
      }
    }
  }

  // Array literal
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed
    }
  }

  return trimmed
}

/**
 * Process markdown content to HTML using remark/rehype pipeline.
 */
async function processMarkdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}

/**
 * Convert hast properties to component props with correct casing.
 * Also parses back JSX expression values that were encoded during preprocessing.
 */
function convertProps(properties: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {}
  for (const [key, value] of Object.entries(properties)) {
    const propName = PROP_NAME_MAP[key] || key
    // HTML boolean attributes come through as empty strings
    if (value === '' || value === true) {
      props[propName] = true
    } else if (typeof value === 'string' && value.startsWith('__jsx:')) {
      // Parse back JSX expressions that were encoded during preprocessing
      const expression = value.slice(6).replace(/&quot;/g, '"')
      props[propName] = parseJsxExpression(expression)
    } else {
      props[propName] = value
    }
  }
  return props
}

/**
 * Check if a hast node is a component element (custom tag).
 */
function isComponentElement(node: any): boolean {
  return node.type === 'element' && COMPONENT_TAG_MAP[node.tagName] !== undefined
}

/**
 * Check if a hast node is a fenced code block (<pre><code class="language-*">).
 * Returns the extracted props for CodeBlock if it is, or null otherwise.
 */
function extractCodeBlockProps(node: any): { code: string; language: string; filename?: string } | null {
  if (node.type !== 'element' || node.tagName !== 'pre') return null
  const codeChild = node.children?.find((c: any) => c.type === 'element' && c.tagName === 'code')
  if (!codeChild) return null

  // Extract language from className like ['language-javascript']
  const classNames: string[] = codeChild.properties?.className || []
  const langClass = classNames.find((c: string) => typeof c === 'string' && c.startsWith('language-'))
  if (!langClass) return null

  const language = langClass.replace('language-', '')

  // Extract text content from the code element
  const code = extractTextContent(codeChild).replace(/\n$/, '')

  // Check for filename in data attributes (e.g. from remark-code-meta)
  const filename = node.properties?.['data-filename'] || codeChild.properties?.['data-filename']

  return { code, language, ...(filename ? { filename } : {}) }
}

/**
 * Recursively extract text content from a hast node.
 */
function extractTextContent(node: any): string {
  if (node.type === 'text') return node.value || ''
  if (node.children) {
    return node.children.map((c: any) => extractTextContent(c)).join('')
  }
  return ''
}

/**
 * Check if hast children contain raw markdown text that needs re-processing.
 * This happens when markdown content is inside custom component tags —
 * the HTML parser treats it as plain text instead of parsing it as markdown.
 */
function childrenContainMarkdownText(children: any[]): boolean {
  for (const child of children) {
    if (child.type === 'text' && child.value) {
      const text = child.value.trim()
      if (!text) continue
      // Check for markdown patterns: headings, bold, italic, links, lists
      // Text nodes inside HTML-parsed component tags often start with \n + whitespace
      if (/(?:^|\n)\s*#{1,6}\s/.test(child.value) ||  // headings
          /\*\*/.test(text) ||                          // bold
          /\[.*\]\(/.test(text) ||                      // links
          /(?:^|\n)\s*[-*+]\s/.test(child.value) ||     // unordered lists
          /(?:^|\n)\s*\d+\.\s/.test(child.value) ||     // ordered lists
          (text.length > 10 && /\n/.test(text.trim()))   // multi-line text content (paragraphs)
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * Remove common leading whitespace from all lines in a text block.
 * This is necessary because markdown content inside component tags
 * inherits indentation from the MDX formatting, and 4+ spaces of
 * indentation would cause remark to treat lines as code blocks.
 */
function dedent(text: string): string {
  const lines = text.split('\n')
  // Find the minimum indentation of non-empty lines
  let minIndent = Infinity
  for (const line of lines) {
    if (line.trim().length === 0) continue
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0
    if (indent < minIndent) minIndent = indent
  }
  if (minIndent === 0 || minIndent === Infinity) return text
  // Strip the common indent from all lines
  return lines.map(line => line.slice(minIndent)).join('\n')
}

/**
 * Extract raw text from hast children, preserving component tags as placeholders.
 * Returns the markdown text and a map of placeholders to component MdxNodes.
 */
async function processComponentChildren(children: any[]): Promise<MdxNode[]> {
  // Separate text runs from component/element children.
  // For sequences of text-only nodes, re-process through markdown.
  // For component elements, process recursively as before.
  const result: MdxNode[] = []
  let textBuffer = ''

  async function flushTextBuffer() {
    if (textBuffer.trim()) {
      // Dedent the text to remove inherited indentation from MDX formatting,
      // otherwise 4+ space indented lines get parsed as code blocks
      const dedented = dedent(textBuffer)

      // Re-process accumulated text through the markdown pipeline
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSlug)
        .use(rehypeKatex)

      const mdast = processor.parse(dedented)
      const hast = await processor.run(mdast)
      const processedChildren = (hast as any).children || []
      // These children are now proper HTML elements (headings, paragraphs, etc.)
      const nodes = await hastChildrenToMdxNodes(processedChildren)
      result.push(...nodes)
    }
    textBuffer = ''
  }

  for (const child of children) {
    if (child.type === 'text') {
      textBuffer += child.value || ''
    } else if (isComponentElement(child)) {
      await flushTextBuffer()
      const componentName = COMPONENT_TAG_MAP[child.tagName]
      const props = convertProps(child.properties || {})
      const childNodes = child.children && child.children.length > 0
        ? await processSmartChildren(child.children)
        : []
      result.push({
        type: 'component',
        name: componentName,
        props,
        children: childNodes,
      })
    } else if (child.type === 'element') {
      // Regular HTML element inside a component — flush text first, then serialize
      await flushTextBuffer()
      const codeBlockProps = extractCodeBlockProps(child)
      if (codeBlockProps) {
        result.push({
          type: 'component',
          name: 'CodeBlock',
          props: codeBlockProps,
          children: [],
        })
      } else if (hasNestedComponent(child)) {
        const openTag = toHtml({ ...child, children: [] }).replace(/<\/[^>]+>$/, '')
        result.push({ type: 'html', content: openTag })
        result.push(...await processSmartChildren(child.children))
        result.push({ type: 'html', content: `</${child.tagName}>` })
      } else {
        const html = toHtml(child).trim()
        if (html) {
          result.push({ type: 'html', content: html })
        }
      }
    }
  }

  await flushTextBuffer()
  return result
}

/**
 * Smart child processing: detects if children contain raw markdown text
 * and re-processes it through the markdown pipeline if needed.
 */
async function processSmartChildren(children: any[]): Promise<MdxNode[]> {
  if (childrenContainMarkdownText(children)) {
    return processComponentChildren(children)
  }
  return hastChildrenToMdxNodes(children)
}

/**
 * Recursively convert hast children to MdxNode array.
 * Groups consecutive non-component nodes into single HTML blocks.
 */
async function hastChildrenToMdxNodes(children: any[]): Promise<MdxNode[]> {
  const nodes: MdxNode[] = []
  let htmlBuffer: any[] = []

  function flushHtmlBuffer() {
    if (htmlBuffer.length > 0) {
      const html = toHtml({ type: 'root', children: htmlBuffer })
      const trimmed = html.trim()
      if (trimmed) {
        nodes.push({ type: 'html', content: trimmed })
      }
      htmlBuffer = []
    }
  }

  for (const child of children) {
    // Check for fenced code blocks first (<pre><code class="language-*">)
    const codeBlockProps = extractCodeBlockProps(child)
    if (codeBlockProps) {
      flushHtmlBuffer()
      nodes.push({
        type: 'component',
        name: 'CodeBlock',
        props: codeBlockProps,
        children: [],
      })
    } else if (isComponentElement(child)) {
      flushHtmlBuffer()
      const componentName = COMPONENT_TAG_MAP[child.tagName]
      const props = convertProps(child.properties || {})
      const childNodes = child.children && child.children.length > 0
        ? await processSmartChildren(child.children)
        : []
      nodes.push({
        type: 'component',
        name: componentName,
        props,
        children: childNodes,
      })
    } else {
      // Check if this regular element contains any component elements nested within
      if (hasNestedComponent(child)) {
        flushHtmlBuffer()
        // This is a regular HTML element that contains component children
        // We need to handle it specially - wrap it as an HTML open tag,
        // then process children, then close tag
        if (child.type === 'element') {
          const openTag = toHtml({ ...child, children: [] }).replace(/<\/[^>]+>$/, '')
          nodes.push({ type: 'html', content: openTag })
          nodes.push(...await hastChildrenToMdxNodes(child.children))
          nodes.push({ type: 'html', content: `</${child.tagName}>` })
        } else {
          htmlBuffer.push(child)
        }
      } else {
        htmlBuffer.push(child)
      }
    }
  }

  flushHtmlBuffer()
  return nodes
}

/**
 * Check if a hast node or any of its descendants is a component element.
 */
function hasNestedComponent(node: any): boolean {
  if (isComponentElement(node)) return true
  if (node.children) {
    return node.children.some((child: any) => hasNestedComponent(child))
  }
  return false
}

/**
 * Process markdown content to a structured MdxNode tree.
 * Runs the same remark/rehype pipeline but produces an AST
 * instead of a stringified HTML output.
 */
async function processMarkdownToMdxNodes(markdown: string): Promise<MdxNode[]> {
  // Pre-process JSX expression attributes into HTML-safe string attributes
  const preprocessed = preprocessJsxExpressions(markdown)

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeKatex)

  const mdast = processor.parse(preprocessed)
  const hast = await processor.run(mdast)

  // The hast root has children - process them into MdxNodes
  const children = (hast as any).children || []
  return hastChildrenToMdxNodes(children)
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
function calculateReadingTime(content: string): { minutes: number; words: number } {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return { minutes, words }
}

export interface DocMeta {
  title: string
  description?: string
  slug?: string
  section?: string
  group?: string
  sidebar?: string
  order?: number
  sidebar_position?: number
  content?: string
  last_updated?: string
  draft?: boolean
  authors?: Array<{ id: string; name?: string }>
  tags?: string[]
  redirect_from?: string[]
  reading_time?: number
  word_count?: number
  icon?: string  // Icon name for sidebar display (Lucide icon name)
  tab_group?: string  // Tab group ID for organizing docs into tabs
  locale?: string // Locale of the document
}

export interface Doc {
  slug: string
  filePath: string  // Original file path for sidebar grouping
  title: string
  meta: DocMeta
  content: string
  contentNodes?: MdxNode[]  // Structured node tree for component rendering
  categoryLabel?: string  // Label from _category_.json
  categoryPosition?: number  // Position from _category_.json
  categoryCollapsible?: boolean  // Collapsible from _category_.json
  categoryCollapsed?: boolean  // Default collapsed state from _category_.json
  categoryIcon?: string  // Icon from _category_.json
  categoryTabGroup?: string  // Tab group from _category_.json
  locale?: string // Locale of the document
}

export interface TocItem {
  id: string
  title: string
  level: number
}

export function getVersions(): string[] {
  try {
    const versions = fs.readdirSync(DOCS_DIR)
    return versions.filter((v) => fs.statSync(path.join(DOCS_DIR, v)).isDirectory())
  } catch (error) {
    return ["v1.0.0"]
  }
}

/**
 * Recursively find all MDX files in a directory
 */
function findMdxFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...findMdxFiles(fullPath, baseDir))
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        // Get relative path from base directory and normalize to forward slashes
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
        files.push(relativePath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return files
}

/**
 * Internal function to read a doc from file path
 */
function readDocFromFile(filePath: string, originalSlug: string): Doc | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    // Validate path is within allowed directory
    if (!validatePathWithinDirectory(filePath, DOCS_DIR)) {
      console.error(`[Security] Path traversal attempt blocked: ${filePath}`)
      return null
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContents)

    // Security: Validate MDX content for dangerous patterns
    const securityCheck = validateMDXSecurity(content, {
      strictMode: process.env.NODE_ENV === 'production',
      blockDangerousPatterns: true,
    })

    if (!securityCheck.valid) {
      console.error(`[Security] MDX validation failed for ${filePath}:`, securityCheck.issues)
      if (process.env.NODE_ENV === 'production') {
        return null
      }
      // In development, log warnings but continue
      console.warn('[Security] Continuing in development mode with sanitized content')
    }

    // Use sanitized content if available
    const safeContent = securityCheck.sanitized || content

    // Calculate reading time
    const { minutes, words } = calculateReadingTime(safeContent)

    // If custom slug provided, replace only the filename part, keep the folder structure
    let finalSlug = originalSlug
    if (data.slug) {
      const customSlug = data.slug.replace(/^\//, '')
      const parts = originalSlug.split("/")

      if (parts.length > 1) {
        // Keep folder structure, replace only filename
        parts[parts.length - 1] = customSlug
        finalSlug = parts.join("/")
      } else {
        // Root level file, use custom slug as-is
        finalSlug = customSlug
      }
    }

    return {
      slug: finalSlug,
      filePath: originalSlug,  // Keep original file path for sidebar
      title: data.title || originalSlug,
      meta: {
        ...data,
        content: safeContent,
        reading_time: minutes,
        word_count: words,
      } as DocMeta,
      content: safeContent,
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}

export function getI18nConfig(): I18nConfig | null {
  const config = getConfig()
  const i18n = config.features?.i18n

  if (!i18n) return null

  if (typeof i18n === 'boolean') {
    return i18n ? {
      defaultLocale: 'en',
      locales: ['en'],
      localeNames: { en: 'English' }
    } : null
  }

  return i18n
}

export async function getDocBySlug(slug: string, version = "v1.0.0", locale?: string): Promise<Doc | null> {
  try {
    // Security: Sanitize and validate slug
    const sanitizedVersion = sanitizePath(version)
    let sanitizedSlug = sanitizePath(slug)

    // Get i18n config
    const i18nConfig = getI18nConfig()

    // Determine locale from slug if not provided
    let detectedLocale = locale || i18nConfig?.defaultLocale

    if (i18nConfig) {
      const parts = sanitizedSlug.split('/')
      if (parts.length > 0 && i18nConfig.locales.includes(parts[0])) {
        detectedLocale = parts[0]
        sanitizedSlug = parts.slice(1).join('/')
        if (sanitizedSlug === "") sanitizedSlug = "index"
      }
    }

    const targetLocale = detectedLocale
    const isDefaultLocale = targetLocale === i18nConfig?.defaultLocale

    // Try finding the file in this order:
    // 1. Localized extension: slug.locale.mdx (e.g. guide.fr.mdx)
    // 2. Default file: slug.mdx (only if using default locale and configured to fallback or strictly default)

    // Construct potential paths
    const basePath = path.join(DOCS_DIR, sanitizedVersion)

    let result: Doc | null = null

    // 1. Try localized file extension
    if (targetLocale) {
      const localizedPath = path.join(basePath, `${sanitizedSlug}.${targetLocale}.mdx`)
      const doc = readDocFromFile(localizedPath, sanitizedSlug)
      if (doc) {
        doc.slug = i18nConfig ? `${targetLocale}/${sanitizedSlug}` : sanitizedSlug
        doc.meta.locale = targetLocale
        result = doc
      }
    }

    // 2. Try default file
    if (!result) {
      const defaultPath = path.join(basePath, `${sanitizedSlug}.mdx`)
      const doc = readDocFromFile(defaultPath, sanitizedSlug)

      if (doc && (isDefaultLocale || !i18nConfig)) {
        const usePrefix = i18nConfig && (i18nConfig.prefixDefault || targetLocale !== i18nConfig.defaultLocale)

        if (usePrefix && targetLocale) {
          doc.slug = `${targetLocale}/${doc.slug}`
        }
        doc.meta.locale = targetLocale || 'en'
        result = doc
      }
    }

    // Process markdown for the found doc
    if (result) {
      const rawContent = result.content
      result.content = await processMarkdownToHtml(rawContent)
      result.contentNodes = await processMarkdownToMdxNodes(rawContent)
    }

    return result
  } catch (error) {
    console.error(`Error reading doc ${slug}:`, error)
    return null
  }
}

export function getAllDocs(version = "v1.0.0", locale?: string): Doc[] {
  try {
    const versionDir = path.join(DOCS_DIR, version)

    if (!fs.existsSync(versionDir)) {
      return []
    }

    // Get i18n config
    const i18nConfig = getI18nConfig()
    const targetLocale = locale || i18nConfig?.defaultLocale || 'en'

    const mdxFiles = findMdxFiles(versionDir)
    const categoryConfigs = getAllCategoryConfigs(version)

    const docs = mdxFiles.map((file) => {
        // file contains path relative to version dir, e.g. "getting-started/intro.mdx" or "intro.fr.mdx"

        let originalFilePath = file.replace(/\.mdx$/, "")

        // Handle localized files
        let isLocalized = false
        let fileLocale = i18nConfig?.defaultLocale || 'en'

        if (i18nConfig) {
          // Check for .<locale> suffix
          const parts = originalFilePath.split('.')
          const lastPart = parts[parts.length - 1]
          if (i18nConfig.locales.includes(lastPart)) {
            fileLocale = lastPart
            isLocalized = true
            originalFilePath = parts.slice(0, -1).join('.')
          }
        }

        // Read doc directly from file (no HTML processing - sidebar only needs metadata)
        const slug = isLocalized ? originalFilePath : originalFilePath
        const filePath = isLocalized
          ? path.join(versionDir, `${originalFilePath}.${fileLocale}.mdx`)
          : path.join(versionDir, `${originalFilePath}.mdx`)

        const doc = readDocFromFile(filePath, slug)

        if (!doc) return null

        // Set locale info
        if (i18nConfig) {
          const usePrefix = i18nConfig.prefixDefault || fileLocale !== i18nConfig.defaultLocale
          doc.slug = usePrefix ? `${fileLocale}/${doc.slug}` : doc.slug
        }
        doc.meta.locale = fileLocale

        // Override filePath properties for sidebar grouping
        // (we want grouped by logical path, not physically localized path if possible)
        doc.filePath = originalFilePath // Use logical path (without .fr) for grouping

        const folderPath = path.dirname(originalFilePath).replace(/\\/g, '/')
        if (folderPath !== ".") {
          const categoryConfig = categoryConfigs.get(folderPath)
          if (categoryConfig) {
            doc.categoryLabel = categoryConfig.label
            doc.categoryPosition = categoryConfig.position ?? categoryConfig.sidebar_position
            doc.categoryCollapsible = categoryConfig.collapsible
            doc.categoryCollapsed = categoryConfig.collapsed
            doc.categoryIcon = categoryConfig.icon
            doc.categoryTabGroup = categoryConfig.tab_group
          }
        }

        return doc
      })

    const isDevelopment = process.env.NODE_ENV === "development"

    // Create a map to track unique slugs and avoid duplicates, prioritizing target locale
    const uniqueDocs = new Map<string, Doc>()

    // Sort docs such that target locale comes first? No, we need to filter/merge.
    const validDocs = docs.filter((doc): doc is Doc => doc !== null && (isDevelopment || !doc.meta.draft))

    // Group by logical slug (we stored logical path in filePath, maybe use that?)
    // Actually doc.slug might differ if custom slug used.

    // If we have intro.mdx (en) and intro.fr.mdx (fr)
    // And targetLocale is 'fr'
    // We want the 'fr' one.

    validDocs.forEach(doc => {
      // Identify logical slug. 
      // If doc.slug already has prefix (e.g. fr/intro), stripped slug is 'intro'.
      let logicalSlug = doc.slug
      if (i18nConfig) {
        const parts = logicalSlug.split('/')
        if (i18nConfig.locales.includes(parts[0])) {
          logicalSlug = parts.slice(1).join('/')
        }
      }

      const existing = uniqueDocs.get(logicalSlug)

      if (!existing) {
        // If doc matches target locale or is default (and we allow default fallback), take it.
        // For now, take everything, filter later?
        // Better: Only add if it matches target locale OR is default and we don't have target yet.
        if (doc.meta.locale === targetLocale) {
          uniqueDocs.set(logicalSlug, doc)
        } else if (doc.meta.locale === i18nConfig?.defaultLocale) {
          uniqueDocs.set(logicalSlug, doc)
        }
      } else {
        // We have an existing entry. prefer targetLocale
        if (doc.meta.locale === targetLocale && existing.meta.locale !== targetLocale) {
          uniqueDocs.set(logicalSlug, doc)
        }
      }
    })

    return Array.from(uniqueDocs.values()).sort((a, b) => {
      const orderA = a.meta.sidebar_position ?? a.meta.order ?? 999
      const orderB = b.meta.sidebar_position ?? b.meta.order ?? 999
      return orderA - orderB
    })
  } catch (error) {
    console.error(`Error getting all docs for version ${version}:`, error)
    return []
  }
}

// export function getAdjacentDocs(currentSlug: string, allDocs: Doc[]): { previous?: Doc; next?: Doc } {
//   const currentIndex = allDocs.findIndex((doc) => doc.slug === currentSlug)

//   if (currentIndex === -1) {
//     return {}
//   }

//   return {
//     previous: currentIndex > 0 ? allDocs[currentIndex - 1] : undefined,
//     next: currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : undefined,
//   }
// }

// Flatten the sidebar structure into a linear order
function flattenSidebarOrder(
  rootGroups: Record<string, SidebarGroup>,
  standalone: Doc[]
): Doc[] {
  const flatDocs: Doc[] = []

  // Recursively flatten groups - intermix folders and files by position
  const flattenGroup = (group: SidebarGroup) => {
    const sortedChildren = sortSidebarGroups(group.children)
    const sortedItems = sortSidebarItems(group.items)

    // Merge child groups and items, then sort by position
    const merged: Array<{ type: 'group', group: SidebarGroup, position: number } | { type: 'item', doc: Doc, position: number }> = [
      ...sortedChildren.map(([, childGroup]) => ({
        type: 'group' as const,
        group: childGroup,
        position: childGroup.position
      })),
      ...sortedItems.map((doc) => ({
        type: 'item' as const,
        doc,
        position: doc.meta.sidebar_position ?? doc.meta.order ?? 999
      }))
    ]

    // Sort by position
    merged.sort((a, b) => a.position - b.position)

    // Process in sorted order
    merged.forEach((item) => {
      if (item.type === 'group') {
        flattenGroup(item.group)
      } else {
        flatDocs.push(item.doc)
      }
    })
  }

  // Add standalone items first
  sortSidebarItems(standalone).forEach((doc) => {
    flatDocs.push(doc)
  })

  // Then add all grouped items
  const sortedRootGroups = sortSidebarGroups(rootGroups)
  sortedRootGroups.forEach(([, group]) => {
    flattenGroup(group)
  })

  return flatDocs
}

export function getAdjacentDocs(currentSlug: string, allDocs: Doc[]): { previous?: Doc; next?: Doc } {
  // Build the same sidebar structure
  const { rootGroups, standalone } = buildSidebarStructure(allDocs)

  // Flatten into the same order as shown in the sidebar
  const orderedDocs = flattenSidebarOrder(rootGroups, standalone)

  // Find current doc in the ordered list
  const currentIndex = orderedDocs.findIndex((doc) => doc.slug === currentSlug)

  if (currentIndex === -1) {
    return {}
  }

  const currentDoc = orderedDocs[currentIndex]

  // Get current doc's tab group (from meta or category)
  const currentTabGroup = currentDoc.meta?.tab_group || currentDoc.categoryTabGroup

  // Filter docs to match the current doc's tab group status
  // If current has a tab group, only show docs in the same tab group
  // If current has NO tab group, only show docs with NO tab group
  const filteredDocs = orderedDocs.filter((doc) => {
    const docTabGroup = doc.meta?.tab_group || doc.categoryTabGroup

    // If current doc has a tab group, only include docs with the same tab group
    if (currentTabGroup) {
      return docTabGroup === currentTabGroup
    }

    // If current doc has no tab group, only include docs with no tab group
    return !docTabGroup
  })

  // Find current doc's index within the filtered list
  const filteredIndex = filteredDocs.findIndex((doc) => doc.slug === currentSlug)

  if (filteredIndex === -1) {
    return {}
  }

  return {
    previous: filteredIndex > 0 ? filteredDocs[filteredIndex - 1] : undefined,
    next: filteredIndex < filteredDocs.length - 1 ? filteredDocs[filteredIndex + 1] : undefined,
  }
}

export function extractTableOfContents(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    // Generate ID the same way rehype-slug does
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens first
      .replace(/[^a-z0-9-]/g, "") // Remove special chars (dots, slashes, etc)
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

    toc.push({ id, title: text, level })
  }

  return toc
}

/**
 * Check if a slug represents a category (has child documents)
 */
export function isCategoryPage(slug: string, allDocs: Doc[]): boolean {
  return allDocs.some((doc) => {
    const parts = doc.slug.split("/")
    const docParent = parts.slice(0, -1).join("/")
    return docParent === slug && doc.slug !== slug
  })
}


