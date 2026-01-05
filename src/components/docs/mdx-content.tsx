import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { remarkCodeMeta } from "@/lib/remark-code-meta"
import { mdxComponents } from "./mdx-components"

interface MDXContentProps {
  source: string
}

/**
 * Pure Server Component wrapper for MDXRemote
 * Isolated from any client component contamination
 */
export function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkCodeMeta],
          rehypePlugins: [rehypeSlug],
          development: false,
        },
      }}
      components={mdxComponents as any}
    />
  )
}
