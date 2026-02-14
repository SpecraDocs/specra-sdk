import type { Snippet } from 'svelte';
interface Props {
    span?: 1 | 2 | 3 | 4;
    children?: Snippet;
}
declare const Column: import("svelte").Component<Props, {}, "">;
type Column = ReturnType<typeof Column>;
export default Column;
