import type { Snippet } from 'svelte';
type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note' | 'danger';
interface Props {
    type?: CalloutType;
    title?: string;
    children?: Snippet;
}
declare const Callout: import("svelte").Component<Props, {}, "">;
type Callout = ReturnType<typeof Callout>;
export default Callout;
