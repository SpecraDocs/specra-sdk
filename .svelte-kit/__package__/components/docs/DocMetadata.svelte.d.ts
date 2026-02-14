import type { SpecraConfig } from '../../config.types.js';
interface DocMeta {
    readingTime?: number;
    lastUpdated?: string;
    authors?: Array<string | {
        name: string;
        avatar?: string;
        url?: string;
    }>;
    [key: string]: unknown;
}
interface Props {
    meta: DocMeta;
    config: SpecraConfig;
}
declare const DocMetadata: import("svelte").Component<Props, {}, "">;
type DocMetadata = ReturnType<typeof DocMetadata>;
export default DocMetadata;
