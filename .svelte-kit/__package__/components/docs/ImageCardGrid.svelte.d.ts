import type { Snippet } from 'svelte';
interface Props {
    cols?: 1 | 2 | 3 | 4;
    children?: Snippet;
}
declare const ImageCardGrid: import("svelte").Component<Props, {}, "">;
type ImageCardGrid = ReturnType<typeof ImageCardGrid>;
export default ImageCardGrid;
