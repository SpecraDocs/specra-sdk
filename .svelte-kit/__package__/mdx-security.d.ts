/**
 * MDX Security Layer
 *
 * Protects against:
 * - XSS via malicious MDX expressions
 * - Path traversal attacks
 * - Dangerous component usage
 * - Cross-domain vulnerabilities
 */
/**
 * Sanitize file paths to prevent path traversal attacks
 * Blocks: ../, ..\, absolute paths, encoded traversal attempts
 */
export declare function sanitizePath(userPath: string): string;
/**
 * Validate that a file path is within allowed directory
 */
export declare function validatePathWithinDirectory(filePath: string, allowedDir: string): boolean;
/**
 * Scan MDX content for dangerous patterns
 * Returns array of detected issues
 * Note: Skips content inside code blocks to avoid false positives
 */
export declare function scanMDXForDangerousPatterns(content: string): string[];
/**
 * Sanitize MDX content by removing/escaping dangerous patterns
 * This is a defensive measure - ideally content should be rejected if dangerous
 */
export declare function sanitizeMDXContent(content: string, strict?: boolean): string;
/**
 * Content Security Policy configuration
 * Use this in your Next.js middleware or headers config
 */
export declare const CSP_DIRECTIVES: {
    readonly "default-src": readonly ["'self'"];
    readonly "script-src": readonly ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
    readonly "style-src": readonly ["'self'", "'unsafe-inline'"];
    readonly "img-src": readonly ["'self'", "data:", "https:"];
    readonly "font-src": readonly ["'self'", "data:"];
    readonly "connect-src": readonly ["'self'"];
    readonly "frame-src": readonly ["'self'"];
    readonly "object-src": readonly ["'none'"];
    readonly "base-uri": readonly ["'self'"];
    readonly "form-action": readonly ["'self'"];
    readonly "frame-ancestors": readonly ["'self'"];
    readonly "upgrade-insecure-requests": readonly [];
};
/**
 * Generate CSP header value from directives
 */
export declare function generateCSPHeader(customDirectives?: Partial<typeof CSP_DIRECTIVES>, production?: boolean): string;
/**
 * Allowlist of safe MDX components
 * Only these components can be used in MDX files
 */
export declare const SAFE_MDX_COMPONENTS: Set<string>;
/**
 * Validate component usage in MDX
 */
export declare function validateMDXComponents(content: string): {
    valid: boolean;
    issues: string[];
};
/**
 * Comprehensive MDX security check
 * Use this before processing MDX content
 */
export declare function validateMDXSecurity(content: string, options?: {
    strictMode?: boolean;
    allowCustomComponents?: boolean;
    blockDangerousPatterns?: boolean;
}): {
    valid: boolean;
    issues: string[];
    sanitized?: string;
};
