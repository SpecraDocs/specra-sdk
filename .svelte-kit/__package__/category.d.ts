export interface CategoryConfig {
    label?: string;
    position?: number;
    sidebar_position?: number;
    link?: {
        type: "generated-index" | "doc";
        slug?: string;
    };
    collapsed?: boolean;
    collapsible?: boolean;
    icon?: string;
    tab_group?: string;
}
/**
 * Read category.json from a folder
 */
export declare function getCategoryConfig(folderPath: string): CategoryConfig | null;
/**
 * Get all category configs for a version
 */
export declare function getAllCategoryConfigs(version: string): Map<string, CategoryConfig>;
