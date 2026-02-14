/**
 * Specra Documentation SDK
 *
 * A modern documentation framework for SvelteKit with:
 * - MDX-based documentation (via mdsvex)
 * - Versioning support
 * - API reference generation (OpenAPI, Postman, Specra formats)
 * - Full-text search integration (MeiliSearch)
 * - Tab groups for organizing content
 * - Dark mode and theming
 * - SEO optimization
 */

// Re-export everything from lib (the SvelteKit package entry point)
export * from './lib/index.js'

// Types
export type { SpecraConfig, SiteConfig, NavigationConfig, ThemeConfig } from './lib/config.types.js'
export type { Doc, DocMeta, TocItem } from './lib/mdx.js'
export type {
  ApiDocumentation,
  ApiSpecConfig,
  ParsedApiSpec,
  RestEndpoint,
  ApiParameter,
  ApiResponse,
  GraphQLSchema,
  WebSocketConnection
} from './lib/api.types.js'
