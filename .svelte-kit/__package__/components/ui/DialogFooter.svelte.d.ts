import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
}
declare const DialogFooter: import("svelte").Component<Props, {}, "">;
type DialogFooter = ReturnType<typeof DialogFooter>;
export default DialogFooter;
