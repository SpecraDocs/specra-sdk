// This file provides MDX components for Next.js App Router
// It allows client components to be used in MDX without "use client" contamination
// See: https://nextjs.org/docs/app/building-your-application/configuring/mdx

import type { MDXComponents } from 'mdx/types'
import { mdxComponents as defaultComponents } from './components/docs/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
  }
}


export { mdxComponents } from './mdx-components-server'

