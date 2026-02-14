import type { Snippet } from 'svelte';
interface Props {
    cols?: 1 | 2 | 3;
    children?: Snippet;
}
declare const CardGrid: import("svelte").Component<Props, {}, "">;
type CardGrid = ReturnType<typeof CardGrid>;
export default CardGrid;
