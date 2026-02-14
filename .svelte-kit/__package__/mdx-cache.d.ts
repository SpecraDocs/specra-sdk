/**
 * Caching layer for MDX operations to improve development performance
 *
 * This module provides in-memory caching for expensive file system operations
 * that occur during static generation. In development mode, caches are
 * invalidated automatically when files change.
 */
import { Doc } from './mdx';
/**
 * Cached version of getVersions()
 */
export declare function getCachedVersions(): string[];
/**
 * Cached version of getAllDocs()
 */
export declare function getCachedAllDocs(version?: string): Promise<Doc[]>;
/**
 * Cached version of getDocBySlug()
 */
export declare function getCachedDocBySlug(slug: string, version?: string): Promise<Doc | null>;
/**
 * Manually clear all caches
 * Useful for testing or when you want to force a refresh
 */
export declare function clearAllCaches(): void;
/**
 * Get cache statistics for debugging
 */
export declare function getCacheStats(): {
    versions: {
        cached: boolean;
        age: number;
    };
    allDocs: {
        entries: number;
        versions: string[];
    };
    docBySlug: {
        entries: number;
    };
};
