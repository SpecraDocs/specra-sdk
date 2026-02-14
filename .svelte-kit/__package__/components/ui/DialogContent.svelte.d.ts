import type { Snippet } from 'svelte';
interface Props {
    class?: string;
    showCloseButton?: boolean;
    children?: Snippet;
    [key: string]: unknown;
}
declare const DialogContent: import("svelte").Component<Props, {}, "">;
type DialogContent = ReturnType<typeof DialogContent>;
export default DialogContent;
