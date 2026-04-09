/**
 * Rehype plugin that prefixes internal absolute links with a base path.
 * Internal links start with "/" and don't start with "http" or "//".
 *
 * Used for GitHub Pages deployments where the site lives under a subpath.
 */
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

interface Options {
  basePath?: string
}

export function rehypeBasePath(options: Options = {}) {
  const { basePath = '' } = options
  if (!basePath) return () => {}

  const cleanBase = basePath.replace(/\/$/, '')

  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href as string
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(cleanBase + '/')) {
          node.properties.href = cleanBase + href
        }
      }
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src as string
        if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('//') && !src.startsWith(cleanBase + '/')) {
          node.properties.src = cleanBase + src
        }
      }
    })
  }
}
