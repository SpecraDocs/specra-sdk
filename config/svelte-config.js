/**
 * Specra SvelteKit Configuration
 *
 * Provides a function that returns SvelteKit-compatible configuration
 * with mdsvex preprocessor and all required remark/rehype plugins.
 *
 * Usage in svelte.config.js:
 * ```js
 * import { specraConfig } from 'specra/svelte-config'
 * const config = specraConfig()
 * export default config
 * ```
 */
import { mdsvex } from 'mdsvex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import fs from 'fs'
import path from 'path'
import { rehypeBasePath } from '../dist/rehype-base-path.js'

/**
 * Get mdsvex preprocessor config with all Specra remark/rehype plugins
 */
export function specraMdsvexConfig(options = {}) {
  return {
    extensions: ['.md', '.svx', '.mdx'],
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      ...(options.remarkPlugins || [])
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      rehypeRaw,
      ...(options.rehypePlugins || [])
    ],
    smartypants: {
      dashes: 'oldschool'
    },
    ...options
  }
}

/**
 * Read the deployment basePath from specra.config.json if present.
 * Falls back to the BASE_PATH environment variable, then empty string.
 */
/**
 * Normalize a base path: ensure leading slash, strip trailing slash.
 * "task_flow" → "/task_flow", "/task_flow/" → "/task_flow", "" → ""
 */
function normalizeBasePath(bp) {
  if (!bp) return ''
  let normalized = bp.startsWith('/') ? bp : `/${bp}`
  return normalized.replace(/\/+$/, '')
}

function resolveBasePath(configPath = path.join(process.cwd(), 'specra.config.json')) {
  // Environment variable takes priority
  if (process.env.BASE_PATH) return normalizeBasePath(process.env.BASE_PATH)

  try {
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (raw.deployment?.basePath) {
        if (raw.deployment?.customDomain) return ''
        return normalizeBasePath(raw.deployment.basePath)
      }
    }
  } catch {
    // Ignore parse errors
  }
  return ''
}

/**
 * Scan the docs/ directory and return prerender entries for every
 * version-root page across all products and the default (no-product)
 * layout. SvelteKit's prerender crawler picks up child pages by
 * following links, but the version-root pages themselves are leaves
 * with no inbound link from a prerendered ancestor (the product
 * dropdown switches between them client-side), so adapter-static
 * needs them seeded explicitly. Without these entries, navigating
 * from one product to another in a static build fetches a
 * non-existent `__data.json` and falls back through to the SPA
 * `index.html` — the client then JSON.parse's HTML and throws
 * `Unexpected token '<', "<!doctype html>"`.
 *
 * Layouts we handle:
 *   docs/v1/...                 → emit `/docs/v1`
 *   docs/v2/...                 → emit `/docs/v2`
 *   docs/sdk/_product_.json     → recurse: docs/sdk/v1 → emit `/docs/sdk/v1`
 *   docs/api/_product_.json     → recurse: docs/api/v1 → emit `/docs/api/v1`
 *
 * `_product_.json` is the marker file Specra uses to identify a
 * multi-product layout (the same marker the SDK's product loader
 * reads).
 */
function discoverVersionEntries(docsDir = path.join(process.cwd(), 'docs')) {
  const entries = ['/']
  try {
    if (!fs.existsSync(docsDir)) return entries

    const items = fs.readdirSync(docsDir, { withFileTypes: true })
    for (const item of items) {
      if (!item.isDirectory()) continue

      // Default-product version: docs/v1 → /docs/v1
      if (/^v\d/.test(item.name)) {
        entries.push(`/docs/${item.name}`)
        continue
      }

      // Multi-product: directory has a _product_.json marker. Recurse
      // into it and emit one entry per version subdirectory.
      const productDir = path.join(docsDir, item.name)
      const productMarker = path.join(productDir, '_product_.json')
      if (!fs.existsSync(productMarker)) continue

      try {
        const versionItems = fs.readdirSync(productDir, { withFileTypes: true })
        for (const v of versionItems) {
          if (v.isDirectory() && /^v\d/.test(v.name)) {
            entries.push(`/docs/${item.name}/${v.name}`)
          }
        }
      } catch {
        // Ignore product-dir read errors — leave that product unseeded.
      }
    }
  } catch {
    // Ignore top-level errors — fall back to just '/'.
  }
  return entries
}

/**
 * Create a full SvelteKit config with Specra defaults.
 * Automatically reads deployment.basePath from specra.config.json
 * for GitHub Pages deployments.
 */
export function specraConfig(options = {}) {
  const { vitePreprocess } = options.vitePreprocess || {}
  const userPrerender = options.kit?.prerender || {}
  const basePath = options.kit?.paths?.base ?? resolveBasePath()

  // Inject base path rehype plugin into mdsvex if basePath is set
  const mdsvexOptions = options.mdsvex || {}
  if (basePath) {
    mdsvexOptions.rehypePlugins = [
      ...(mdsvexOptions.rehypePlugins || []),
      [rehypeBasePath, { basePath }],
    ]
  }

  return {
    extensions: ['.svelte', '.md', '.svx', '.mdx'],
    preprocess: [
      ...(vitePreprocess ? [vitePreprocess()] : []),
      mdsvex(specraMdsvexConfig(mdsvexOptions))
    ],
    kit: {
      ...options.kit,
      paths: {
        ...options.kit?.paths,
        base: basePath,
      },
      prerender: {
        handleHttpError: 'warn',
        handleMissingId: 'warn',
        handleUnseenRoutes: 'warn',
        entries: discoverVersionEntries(),
        ...userPrerender,
      }
    }
  }
}

export default specraConfig
