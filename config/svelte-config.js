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
 * Create a full SvelteKit config with Specra defaults
 */
export function specraConfig(options = {}) {
  const { vitePreprocess } = options.vitePreprocess || {}

  return {
    extensions: ['.svelte', '.md', '.svx', '.mdx'],
    preprocess: [
      ...(vitePreprocess ? [vitePreprocess()] : []),
      mdsvex(specraMdsvexConfig(options.mdsvex || {}))
    ],
    kit: {
      ...(options.kit || {})
    }
  }
}

export default specraConfig
