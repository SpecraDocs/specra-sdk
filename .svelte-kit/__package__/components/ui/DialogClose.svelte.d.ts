import type { Snippet } from 'svelte';
interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
}
declare const DialogClose: import("svelte").Component<Props, {}, "">;
type DialogClose = ReturnType<typeof DialogClose>;
export default DialogClose;
