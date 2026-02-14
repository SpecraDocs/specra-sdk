import type { SpecraConfig } from '../../config.types.js';
import type { Snippet } from 'svelte';
interface DocItem {
    slug: string;
    filePath: string;
    version?: string;
    meta?: {
        title?: string;
        description?: string;
        sidebar_position?: number;
        icon?: string;
        [key: string]: unknown;
    };
    title?: string;
    description?: string;
    [key: string]: unknown;
}
interface Props {
    categoryPath: string;
    version: string;
    allDocs: DocItem[];
    title?: string;
    description?: string;
    content?: Snippet;
    config: SpecraConfig;
}
declare const CategoryIndex: import("svelte").Component<Props, {}, "">;
type CategoryIndex = ReturnType<typeof CategoryIndex>;
export default CategoryIndex;
