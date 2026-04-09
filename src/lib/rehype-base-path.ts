/**
 * Rehype plugin that prefixes internal absolute links with a base path.
 * Internal links start with "/" and don't start with "http" or "//".
 *
 * Used for GitHub Pages deployments where the site lives under a subpath.
 *
 * Manually walks the tree to avoid ESM/CJS issues with unist-util-visit
 * when loaded from svelte-config.js at Node.js config time.
 */
import type { Root, Element, RootContent } from 'hast'

interface Options {
  basePath?: string
}

function walkElements(nodes: RootContent[], fn: (node: Element) => void) {
  for (const node of nodes) {
    if (node.type === 'element') {
      fn(node)
      if (node.children) {
        walkElements(node.children as RootContent[], fn)
      }
    }
  }
}

export function rehypeBasePath(options: Options = {}) {
  const { basePath = '' } = options
  if (!basePath) return () => {}

  const cleanBase = basePath.replace(/\/$/, '')

  return (tree: Root) => {
    walkElements(tree.children as RootContent[], (node: Element) => {
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
