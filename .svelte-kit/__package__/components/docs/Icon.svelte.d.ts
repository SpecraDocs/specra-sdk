import type { ComponentType } from 'svelte';
interface Props {
    icon: string | ComponentType;
    iconType?: 'lucide' | 'url' | 'fa' | 'auto';
    color?: string;
    size?: number | string;
    className?: string;
}
declare const Icon: import("svelte").Component<Props, {}, "">;
type Icon = ReturnType<typeof Icon>;
export default Icon;
