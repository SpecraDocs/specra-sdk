/**
 * Render a plain label string that may contain inline-code markdown
 * (backtick-delimited spans) into safe HTML, turning `` `code` `` into
 * `<code>code</code>`. Used for TOC entries and sidebar labels, which come from
 * headings / frontmatter titles as raw text - without this they show the literal
 * backticks instead of formatted code.
 *
 * Everything is HTML-escaped (both the surrounding text and the code content),
 * so the result is safe to use with `{@html}`. Only inline code is handled; no
 * other markdown is interpreted.
 */
function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

export function renderInlineCode(text: string): string {
	if (!text) return '';
	let out = '';
	let last = 0;
	const re = /`([^`]+)`/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		out += escapeHtml(text.slice(last, m.index));
		out += `<code>${escapeHtml(m[1])}</code>`;
		last = m.index + m[0].length;
	}
	out += escapeHtml(text.slice(last));
	return out;
}
