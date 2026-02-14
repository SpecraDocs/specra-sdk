import type { SpecraConfig } from '../../config.types.js';
import type { Snippet } from 'svelte';
interface DocMeta {
    title: string;
    description?: string;
    draft?: boolean;
    reading_time?: number;
    last_updated?: string;
    locale?: string;
    authors?: Array<{
        id: string;
        name?: string;
    }>;
    tags?: string[];
    [key: string]: any;
}
interface NavDoc {
    title: string;
    slug: string;
}
interface Props {
    meta: DocMeta;
    previousDoc?: NavDoc;
    nextDoc?: NavDoc;
    version: string;
    slug: string;
    config: SpecraConfig;
    children: Snippet;
}
declare const DocLayout: import("svelte").Component<Props, {}, "">;
type DocLayout = ReturnType<typeof DocLayout>;
export default DocLayout;
