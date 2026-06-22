/**
 * Remark plugin to read a code block's fence meta string and expose the
 * recognised options as `data-*` attributes on the rendered <code>.
 *
 * Supported syntax:
 *   ```js title="app.js"          -> data-filename="app.js"
 *   ```ts title='src/index.ts'    -> data-filename="src/index.ts"
 *   ```js showLineNumbers         -> data-line-numbers="true"
 *   ```js showLineNumbers=true    -> data-line-numbers="true"
 *
 * Line numbers are opt-in: only an explicit `showLineNumbers` (or
 * `showLineNumbers=true`) turns them on; absence (or `=false`) leaves them off.
 */
export function remarkCodeMeta() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === 'code' && node.meta) {
        const hProperties: Record<string, string> = {}

        // title="..." / title='...' -> filename shown in the code block header.
        const titleMatch =
          node.meta.match(/\btitle\s*=\s*"([^"]*)"/i) ||
          node.meta.match(/\btitle\s*=\s*'([^']*)'/i)
        if (titleMatch) {
          hProperties['data-filename'] = titleMatch[1]
        }

        // showLineNumbers (opt-in). Bare flag or `=true` enables; `=false` keeps off.
        const lineNumbersMatch = node.meta.match(
          /\bshowLineNumbers(?:\s*=\s*(true|false))?\b/i
        )
        if (
          lineNumbersMatch &&
          (lineNumbersMatch[1] === undefined ||
            lineNumbersMatch[1].toLowerCase() === 'true')
        ) {
          hProperties['data-line-numbers'] = 'true'
        }

        if (Object.keys(hProperties).length > 0) {
          node.data = node.data || {}
          node.data.hProperties = { ...(node.data.hProperties || {}), ...hProperties }
        }
      }

      if (node.children) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}
