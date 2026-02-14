interface Props {
    src: string;
    caption?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    poster?: string;
}
declare const Video: import("svelte").Component<Props, {}, "">;
type Video = ReturnType<typeof Video>;
export default Video;
