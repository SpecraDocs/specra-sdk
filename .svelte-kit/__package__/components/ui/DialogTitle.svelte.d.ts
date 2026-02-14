import type { Snippet } from 'svelte';
interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
}
declare const DialogTitle: import("svelte").Component<Props, {}, "">;
type DialogTitle = ReturnType<typeof DialogTitle>;
export default DialogTitle;
