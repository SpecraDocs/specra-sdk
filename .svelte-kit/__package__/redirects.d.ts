export interface RedirectMapping {
    from: string;
    to: string;
}
/**
 * Build redirect mappings from all docs' redirect_from frontmatter
 */
export declare function buildRedirectMappings(): Promise<RedirectMapping[]>;
/**
 * Find redirect destination for a given path
 */
export declare function findRedirect(path: string): Promise<string | null>;
