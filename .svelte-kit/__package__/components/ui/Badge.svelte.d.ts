import { type VariantProps } from 'class-variance-authority';
export declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariants['variant'];
    class?: string;
    children?: Snippet;
}
declare const Badge: import("svelte").Component<Props, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
