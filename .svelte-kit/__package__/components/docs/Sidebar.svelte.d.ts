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
    onLinkClick?: () => void;
    config: SpecraConfig;
    activeTabGroup?: string;
}
declare const Sidebar: import("svelte").Component<Props, {}, "">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
