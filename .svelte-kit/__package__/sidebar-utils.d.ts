/**
 * Unified sidebar sorting and structure building utilities
 * This module provides consistent sidebar logic across the application
 * to ensure ordering is handled the same way everywhere.
 */
export interface SidebarGroup {
    label: string;
    path: string;
    icon?: string;
    items: any[];
    position: number;
    collapsible: boolean;
    defaultCollapsed: boolean;
    children: Record<string, SidebarGroup>;
}
/**
 * Sort sidebar items by their position.
 * Items with explicit sidebar_position come first (sorted numerically),
 * followed by items without position (sorted by their original order).
 *
 * @param items - Array of items with optional sidebar_position
 * @returns Sorted array of items
 */
export declare function sortSidebarItems<T extends {
    sidebar_position?: number;
    meta?: any;
}>(items: T[]): T[];
/**
 * Sort sidebar groups by their position.
 * Groups with explicit position come first (sorted numerically),
 * followed by groups without position at the end (sorted by their original order).
 *
 * @param groups - Record of group key to group object with position
 * @returns Sorted array of [key, group] tuples
 */
export declare function sortSidebarGroups<T extends {
    position: number;
}>(groups: Record<string, T>): [string, T][];
/**
 * Build hierarchical sidebar structure from flat list of documents
 * This is the single source of truth for sidebar structure used by both
 * the sidebar component and navigation (prev/next) links.
 *
 * @param docs - Array of documents with metadata
 * @returns Object containing root groups and standalone items
 */
export declare function buildSidebarStructure<T extends {
    filePath: string;
    slug: string;
    categoryLabel?: string;
    categoryPosition?: number;
    categoryIcon?: string;
    categoryCollapsible?: boolean;
    categoryCollapsed?: boolean;
    meta: any;
}>(docs: T[]): {
    rootGroups: Record<string, SidebarGroup>;
    standalone: T[];
};
