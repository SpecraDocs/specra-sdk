import type { Snippet } from 'svelte';
interface Props {
    title: string;
    children?: Snippet;
}
declare const Step: import("svelte").Component<Props, {}, "">;
type Step = ReturnType<typeof Step>;
export default Step;
