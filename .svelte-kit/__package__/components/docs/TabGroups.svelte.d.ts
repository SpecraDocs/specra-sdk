import type { TabGroup } from '../../config.types.js';
interface DocItem {
    slug: string;
    version?: string;
    meta?: {
        tab_group?: string;
        title?: string;
        [key: string]: unknown;
    };
    tabGroup?: string;
    categoryTabGroup?: string;
    [key: string]: unknown;
}
interface Props {
    tabGroups: TabGroup[];
    activeTabId?: string;
    onTabChange?: (tabId: string) => void;
    mobileOnly?: boolean;
    docs?: DocItem[];
    version?: string;
}
declare const TabGroups: import("svelte").Component<Props, {}, "">;
type TabGroups = ReturnType<typeof TabGroups>;
export default TabGroups;
