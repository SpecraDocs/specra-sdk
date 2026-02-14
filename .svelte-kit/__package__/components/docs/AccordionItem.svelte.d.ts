import type { Snippet } from 'svelte';
interface Props {
    title: string;
    defaultOpen?: boolean;
    value?: string;
    children?: Snippet;
}
declare const AccordionItem: import("svelte").Component<Props, {}, "">;
type AccordionItem = ReturnType<typeof AccordionItem>;
export default AccordionItem;
