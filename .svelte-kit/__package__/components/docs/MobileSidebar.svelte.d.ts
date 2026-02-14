import type { SpecraConfig } from '../../config.types.js';
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
    docs: DocItem[];
    version: string;
    config: SpecraConfig;
    activeTabGroup?: string;
    onTabChange?: (tabId: string) => void;
}
declare const MobileSidebar: import("svelte").Component<Props, {}, "">;
type MobileSidebar = ReturnType<typeof MobileSidebar>;
export default MobileSidebar;
