import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { remarkCodeMeta } from "@/lib/remark-code-meta"
import { mdxComponents } from "./mdx-components"

interface MDXContentProps {
  source: string
}

/**
 * Server Component for rendering MDX content
 * This is separated to handle the async nature of MDXRemote properly
 */
export async function MDXContent({ source }: MDXContentProps) {
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
