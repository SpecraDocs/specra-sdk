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

import { generateCSPHeader } from '../mdx-security.js'
import type { Handle } from '@sveltejs/kit'

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/**
 * Apply security headers to a Response
 */
export function applySecurityHeaders(
  response: Response,
  options?: {
    customCSP?: string
    production?: boolean
  }
): Response {
  const { customCSP, production = true } = options || {}

  // Apply standard security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  // Apply CSP
  const csp = customCSP || generateCSPHeader(undefined, production)
  response.headers.set('Content-Security-Policy', csp)

  return response
}

/**
 * Validate request path for security issues
 */
export function validateRequestPath(pathname: string): {
  valid: boolean
  reason?: string
} {
  // Decode the pathname to catch encoded attacks
  const decoded = decodeURIComponent(pathname)

  // Check for path traversal
  if (decoded.includes('../') || decoded.includes('..\\')) {
    return { valid: false, reason: 'Path traversal detected' }
  }

  // Check for encoded path traversal
  if (
    decoded.includes('%2e%2e') ||
    decoded.includes('%252e%252e') ||
    pathname.includes('%2e%2e') ||
    pathname.includes('%252e%252e')
  ) {
    return { valid: false, reason: 'Encoded path traversal detected' }
  }

  // Check for null bytes
  if (decoded.includes('\0') || pathname.includes('%00')) {
    return { valid: false, reason: 'Null byte injection detected' }
  }

  return { valid: true }
}

/**
 * Create a SvelteKit handle for security middleware
 */
export function createSecurityHandle(options?: {
  customCSP?: string
  production?: boolean
  strictPathValidation?: boolean
}): Handle {
  return async ({ event, resolve }) => {
    const { strictPathValidation = true } = options || {}

    // Validate request path
    if (strictPathValidation) {
      const pathValidation = validateRequestPath(event.url.pathname)
      if (!pathValidation.valid) {
        const ip =
          event.request.headers.get('x-forwarded-for') ||
          event.request.headers.get('x-real-ip') ||
          'unknown'
        console.warn(`[Security] Blocked request: ${pathValidation.reason}`, {
          path: event.url.pathname,
          ip,
        })
        return new Response('Bad Request', { status: 400 })
      }
    }

    // Continue with the request and apply security headers
    const response = await resolve(event)
    return applySecurityHeaders(response, options)
  }
}

/**
 * Validate subdomain/organization isolation
 * Use this if you're building a multi-tenant system
 */
export function validateSubdomainIsolation(
  hostname: string,
  pathname: string,
  options: {
    allowedSubdomains?: string[]
    currentOrg?: string
  }
): { valid: boolean; reason?: string } {
  const { allowedSubdomains, currentOrg } = options

  const subdomain = hostname.split('.')[0]

  // If allowlist is provided, validate against it
  if (allowedSubdomains && !allowedSubdomains.includes(subdomain)) {
    return { valid: false, reason: 'Subdomain not in allowlist' }
  }

  // Check for subdomain mismatch in paths
  const pathMatch = pathname.match(/\/(static|assets|_.*?)\/([^/]+)/)
  if (pathMatch && currentOrg) {
    const pathOrg = pathMatch[2]
    if (pathOrg !== currentOrg) {
      return { valid: false, reason: 'Cross-organization access detected' }
    }
  }

  return { valid: true }
}
