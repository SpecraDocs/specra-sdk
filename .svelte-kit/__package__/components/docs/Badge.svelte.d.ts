import type { Snippet } from 'svelte';
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
interface Props {
    variant?: BadgeVariant;
    children?: Snippet;
}
declare const Badge: import("svelte").Component<Props, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
