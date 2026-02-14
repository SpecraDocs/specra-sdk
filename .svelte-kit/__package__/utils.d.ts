import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Get the correct asset path based on deployment configuration
 * Handles different deployment scenarios:
 * - Vercel/Node.js hosting (standalone build): No basePath needed
 * - GitHub Pages without custom domain: Uses basePath from config
 * - Static hosting with custom domain: No basePath needed
 *
 * @param path - The asset path (can start with or without '/')
 * @returns The properly formatted asset path
 */
export declare function getAssetPath(path: string): string;
