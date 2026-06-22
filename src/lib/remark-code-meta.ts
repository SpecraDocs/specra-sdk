/**
 * Remark plugin to extract a code block's title/filename from its fence meta
 * string and expose it as a `data-filename` attribute on the rendered <code>.
 *
 * Supported syntax:
 *   ```js title="app.js"
 *   ```ts title='src/index.ts'
 */
export function remarkCodeMeta() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === 'code' && node.meta) {
        // Extract a title="..." / title='...' filename if present and expose it
        // as a valid HTML5 data-* attribute for the renderer to pick up.
        const match =
          node.meta.match(/\btitle\s*=\s*"([^"]*)"/i) ||
          node.meta.match(/\btitle\s*=\s*'([^']*)'/i)
        if (match) {
          node.data = node.data || {}
          node.data.hProperties = node.data.hProperties || {}
          node.data.hProperties['data-filename'] = match[1]
        }
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}
