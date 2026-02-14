export interface DocMeta {
    title: string;
    description?: string;
    slug?: string;
    section?: string;
    group?: string;
    sidebar?: string;
    order?: number;
    sidebar_position?: number;
    content?: string;
    last_updated?: string;
    draft?: boolean;
    authors?: Array<{
        id: string;
        name?: string;
    }>;
    tags?: string[];
    redirect_from?: string[];
    reading_time?: number;
    word_count?: number;
    icon?: string;
    tab_group?: string;
    locale?: string;
}
export interface Doc {
    slug: string;
    filePath: string;
    title: string;
    meta: DocMeta;
    content: string;
    categoryLabel?: string;
    categoryPosition?: number;
    categoryCollapsible?: boolean;
    categoryCollapsed?: boolean;
    categoryIcon?: string;
    categoryTabGroup?: string;
    locale?: string;
}
export interface TocItem {
    id: string;
    title: string;
    level: number;
}
export declare function getVersions(): string[];
export declare function getDocBySlug(slug: string, version?: string, locale?: string): Promise<Doc | null>;
export declare function getAllDocs(version?: string, locale?: string): Promise<Doc[]>;
export declare function getAdjacentDocs(currentSlug: string, allDocs: Doc[]): {
    previous?: Doc;
    next?: Doc;
};
export declare function extractTableOfContents(content: string): TocItem[];
/**
 * Check if a slug represents a category (has child documents)
 */
export declare function isCategoryPage(slug: string, allDocs: Doc[]): boolean;
