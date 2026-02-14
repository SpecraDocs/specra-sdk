import type { Snippet } from 'svelte';
interface Props {
    children?: Snippet;
    type?: 'single' | 'multiple';
    collapsible?: boolean;
    class?: string;
}
declare const Accordion: import("svelte").Component<Props, {}, "">;
type Accordion = ReturnType<typeof Accordion>;
export default Accordion;
