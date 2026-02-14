/**
 * Security Middleware for SvelteKit
 *
 * Implements:
 * - Content Security Policy (CSP)
 * - Additional security headers
 * - Path traversal protection
 *
 * Usage in hooks.server.ts:
 * ```typescript
 * import { sequence } from '@sveltejs/kit/hooks'
 * import { createSecurityHandle } from 'specra/middleware/security'
 *
 * export const handle = sequence(
 *   createSecurityHandle(),
 *   // ... other handles
 * )
 * ```
 */
import type { Handle } from '@sveltejs/kit';
/**
 * Security headers configuration
 */
export declare const SECURITY_HEADERS: Record<string, string>;
/**
 * Apply security headers to a Response
 */
export declare function applySecurityHeaders(response: Response, options?: {
    customCSP?: string;
    production?: boolean;
}): Response;
/**
 * Validate request path for security issues
 */
export declare function validateRequestPath(pathname: string): {
    valid: boolean;
    reason?: string;
};
/**
 * Create a SvelteKit handle for security middleware
 */
export declare function createSecurityHandle(options?: {
    customCSP?: string;
    production?: boolean;
    strictPathValidation?: boolean;
}): Handle;
/**
 * Validate subdomain/organization isolation
 * Use this if you're building a multi-tenant system
 */
export declare function validateSubdomainIsolation(hostname: string, pathname: string, options: {
    allowedSubdomains?: string[];
    currentOrg?: string;
}): {
    valid: boolean;
    reason?: string;
};
