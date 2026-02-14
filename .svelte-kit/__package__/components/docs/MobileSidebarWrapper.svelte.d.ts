import type { SpecraConfig } from '../../config.types.js';
import type { Snippet } from 'svelte';
interface DocItem {
    title: string;
    slug: string;
    filePath: string;
    section?: string;
    group?: string;
    sidebar?: string;
    sidebar_position?: number;
    categoryLabel?: string;
    categoryPosition?: number;
    categoryCollapsible?: boolean;
    categoryCollapsed?: boolean;
    categoryIcon?: string;
    categoryTabGroup?: string;
    meta?: {
        icon?: string;
        tab_group?: string;
        [key: string]: any;
    };
}
interface Props {
    header: Snippet;
    docs: DocItem[];
    version: string;
    config: SpecraConfig;
    activeTabGroup?: string;
}
declare const MobileSidebarWrapper: import("svelte").Component<Props, {}, "">;
type MobileSidebarWrapper = ReturnType<typeof MobileSidebarWrapper>;
export default MobileSidebarWrapper;
