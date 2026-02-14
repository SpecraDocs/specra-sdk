interface Props {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    href?: string;
    external?: boolean;
    aspectRatio?: 'square' | 'video' | 'portrait';
}
declare const ImageCard: import("svelte").Component<Props, {}, "">;
type ImageCard = ReturnType<typeof ImageCard>;
export default ImageCard;
