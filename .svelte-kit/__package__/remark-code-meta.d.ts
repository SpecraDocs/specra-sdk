/**
 * Remark plugin to extract code block meta strings and pass them as props
 * Converts: ```js filename.js
 * Into props: { language: 'js', meta: 'filename.js' }
 */
export declare function remarkCodeMeta(): (tree: any) => void;
