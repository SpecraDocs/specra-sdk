import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
}
declare const DialogHeader: import("svelte").Component<Props, {}, "">;
type DialogHeader = ReturnType<typeof DialogHeader>;
export default DialogHeader;
