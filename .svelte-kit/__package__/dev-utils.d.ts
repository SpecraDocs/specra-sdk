/**
 * Development utilities for debugging and performance monitoring
 * Only active in development mode
 */
/**
 * Performance timer for measuring operation duration
 */
export declare class PerfTimer {
    private startTime;
    private label;
    constructor(label: string);
    end(): void;
}
/**
 * Log file system operations
 */
export declare function logFsOperation(operation: string, path: string, details?: any): void;
/**
 * Log cache operations
 */
export declare function logCacheOperation(operation: 'hit' | 'miss' | 'invalidate', key: string): void;
/**
 * Memory usage reporter
 */
export declare function logMemoryUsage(label?: string): void;
/**
 * Pretty print object for debugging
 */
export declare function debugLog(label: string, data: any): void;
