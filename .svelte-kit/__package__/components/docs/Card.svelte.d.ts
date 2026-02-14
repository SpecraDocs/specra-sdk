import type { Snippet } from 'svelte';
interface Props {
    title: string;
    description?: string;
    href?: string;
    icon?: string;
    external?: boolean;
    children?: Snippet;
}
declare const Card: import("svelte").Component<Props, {}, "">;
type Card = ReturnType<typeof Card>;
export default Card;
