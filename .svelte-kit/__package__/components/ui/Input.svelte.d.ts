import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
    class?: string;
    type?: HTMLInputAttributes['type'];
}
declare const Input: import("svelte").Component<Props, {}, "">;
type Input = ReturnType<typeof Input>;
export default Input;
