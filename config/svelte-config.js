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
function resolveBasePath(configPath = path.join(process.cwd(), 'specra.config.json')) {
  // Environment variable takes priority
  if (process.env.BASE_PATH) return process.env.BASE_PATH

  try {
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (raw.deployment?.basePath) {
        const bp = raw.deployment.basePath
        // If custom domain is set, ignore basePath
        if (raw.deployment?.customDomain) return ''
        return bp.startsWith('/') ? bp : `/${bp}`
      }
    }
  } catch {
    // Ignore parse errors
  }
  return ''
}

/**
 * Scan the docs/ directory and return prerender entries for all version root pages.
 * This ensures adapter-static discovers and prerenders every version, not just the active one.
 */
function discoverVersionEntries(docsDir = path.join(process.cwd(), 'docs')) {
  const entries = ['/']
  try {
    if (!fs.existsSync(docsDir)) return entries

    const items = fs.readdirSync(docsDir, { withFileTypes: true })
    for (const item of items) {
      if (item.isDirectory() && /^v\d/.test(item.name)) {
        entries.push(`/docs/${item.name}`)
      }
    }
  } catch {
    // Ignore errors — fall back to just '/'
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
