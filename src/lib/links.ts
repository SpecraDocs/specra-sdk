import { base } from '$app/paths';

/**
 * Prefix an absolute app path with the configured SvelteKit base path
 * (derived from `deployment.basePath` in specra.config.json).
 *
 * SvelteKit does not auto-apply the base path to `redirect()` targets or to
 * raw `href` string literals, so any link or redirect built from a string must
 * go through this helper to resolve correctly under a subpath deployment
 * (e.g. GitHub Pages at `/repo/`). It works in both client and server code,
 * since `base` is a plain string.
 *
 *   <a href={link('/docs/v1/intro')}>        -> `${base}/docs/v1/intro`
 *   redirect(302, link(`/docs/${version}`))  -> `${base}/docs/...`
 *
 * Passing an empty string returns the site root under the base path.
 */
export function link(path: string): string {
	if (!path || path === '/') return base || '/';
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base}${p}`;
}
