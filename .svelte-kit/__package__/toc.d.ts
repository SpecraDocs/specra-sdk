export interface TOCItem {
    id: string;
    title: string;
    level: number;
}
/**
 * Extract headings from HTML string for table of contents
 */
export declare function extractHeadings(html: string): TOCItem[];
