import type { SpecraConfig } from '../../config.types.js';
import type { TOCItem } from '../../toc.js';
interface Props {
    items: TOCItem[];
    config: SpecraConfig;
}
declare const TableOfContents: import("svelte").Component<Props, {}, "">;
type TableOfContents = ReturnType<typeof TableOfContents>;
export default TableOfContents;
