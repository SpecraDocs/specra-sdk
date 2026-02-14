import type { Snippet } from 'svelte';
interface Props {
    cols?: {
        sm?: 1 | 2 | 3 | 4;
        md?: 1 | 2 | 3 | 4;
        lg?: 1 | 2 | 3 | 4;
        xl?: 1 | 2 | 3 | 4;
    };
    children?: Snippet;
}
declare const Columns: import("svelte").Component<Props, {}, "">;
type Columns = ReturnType<typeof Columns>;
export default Columns;
