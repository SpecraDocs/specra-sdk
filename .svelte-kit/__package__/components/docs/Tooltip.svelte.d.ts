import type { Snippet } from 'svelte';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface Props {
    content: string;
    position?: TooltipPosition;
    children?: Snippet;
}
declare const Tooltip: import("svelte").Component<Props, {}, "">;
type Tooltip = ReturnType<typeof Tooltip>;
export default Tooltip;
