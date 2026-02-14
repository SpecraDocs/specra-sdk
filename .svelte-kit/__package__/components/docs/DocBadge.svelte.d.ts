import type { Snippet } from 'svelte';
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
interface Props {
    variant?: BadgeVariant;
    children?: Snippet;
}
declare const DocBadge: import("svelte").Component<Props, {}, "">;
type DocBadge = ReturnType<typeof DocBadge>;
export default DocBadge;
