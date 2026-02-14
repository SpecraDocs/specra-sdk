interface Props {
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
    zoom?: boolean;
}
declare const Image: import("svelte").Component<Props, {}, "">;
type Image = ReturnType<typeof Image>;
export default Image;
