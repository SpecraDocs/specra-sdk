interface Props {
    logo?: string | {
        light: string;
        dark: string;
    };
    alt?: string;
    className?: string;
}
declare const Logo: import("svelte").Component<Props, {}, "">;
type Logo = ReturnType<typeof Logo>;
export default Logo;
