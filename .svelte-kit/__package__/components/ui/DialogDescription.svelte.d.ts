import type { Snippet } from 'svelte';
interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
}
declare const DialogDescription: import("svelte").Component<Props, {}, "">;
type DialogDescription = ReturnType<typeof DialogDescription>;
export default DialogDescription;
