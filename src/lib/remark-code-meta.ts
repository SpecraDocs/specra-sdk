/**
 * Remark plugin to read a code block's fence meta string and expose the
 * recognised options as `data-*` attributes on the rendered <code>.
 *
 * Supported syntax:
 *   ```js title="app.js"          -> data-filename="app.js"
 *   ```ts title='src/index.ts'    -> data-filename="src/index.ts"
 *   ```js showLineNumbers         -> data-line-numbers="true"
 *   ```js showLineNumbers=true    -> data-line-numbers="true"
 *   ```html diff                  -> data-diff="true"
 *
 * Line numbers and diff markers are opt-in: only an explicit flag turns them on.
 * `diff` lets a syntax-highlighted block (any language) render leading `-`/`+`
 * lines as removed/added without auto-detecting them across every language.
 */
export function remarkCodeMeta() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === 'code' && node.meta) {
        const meta: string = node.meta
        const hProperties: Record<string, string> = {}

        // title="..." / title='...' -> filename shown in the code block header.
        const titleMatch =
          meta.match(/\btitle\s*=\s*"([^"]*)"/i) ||
          meta.match(/\btitle\s*=\s*'([^']*)'/i)
        if (titleMatch) {
          hProperties['data-filename'] = titleMatch[1]
        }

        // Strip quoted `key="..."` / `key='...'` values before scanning for bare
        // flags, so a value like title="my diff notes" can't false-match below.
        const flags = meta
          .replace(/\b\w+\s*=\s*"[^"]*"/g, ' ')
          .replace(/\b\w+\s*=\s*'[^']*'/g, ' ')

        // showLineNumbers (opt-in). Bare flag or `=true` enables; `=false` keeps off.
        const lineNumbersMatch = flags.match(
          /\bshowLineNumbers(?:\s*=\s*(true|false))?\b/i
        )
        if (
          lineNumbersMatch &&
          (lineNumbersMatch[1] === undefined ||
            lineNumbersMatch[1].toLowerCase() === 'true')
        ) {
          hProperties['data-line-numbers'] = 'true'
        }

        // diff (opt-in): treat leading -/+ lines as removed/added.
        if (/\bdiff\b/i.test(flags)) {
          hProperties['data-diff'] = 'true'
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
