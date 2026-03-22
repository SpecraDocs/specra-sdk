import fs from "fs"
import path from "path"
import type { SpecraConfig, VersionConfig, ProductConfig, Product } from "./config.types"
import { defaultConfig } from "./config.types"

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(
        targetValue && typeof targetValue === "object" ? targetValue : {},
        sourceValue,
      ) as T[Extract<keyof T, string>]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * Load and parse the Specra configuration file
 * Falls back to default configuration if file doesn't exist or is invalid
 */
export function loadConfig(userConfig: Partial<SpecraConfig>): SpecraConfig {
  try {
    // const userConfig = specraConfigJson as unknown as Partial<SpecraConfig>

    // Merge user config with defaults  
    const config = deepMerge(defaultConfig, userConfig)

    return config
  } catch (error) {
    console.error(`❌ Error loading configuration:`, error)
    console.warn("Using default configuration.")
    return defaultConfig
  }
}

/**
 * Get a specific configuration value by path (SERVER ONLY)
 * Example: getConfigValue('site.title') or getConfigValue('theme.defaultMode')
 */
export function getConfigValue<T = any>(path: string, config?: SpecraConfig): T | undefined {
  const cfg = config || loadConfig({})
  const keys = path.split(".")
  let value: any = cfg

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }

  return value as T
}

/**
 * Replace environment variables in a string (SERVER ONLY)
 * Supports ${ENV_VAR} and {{ENV_VAR}} syntax
 */
export function replaceEnvVariables(text: string, config?: SpecraConfig): string {
  const cfg = config || loadConfig({})
  const envVars = cfg.env || {}

  let result = text

  // Replace ${VAR} syntax
  result = result.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    return envVars[varName] || match
  })

  // Replace {{VAR}} syntax
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    return envVars[varName] || match
  })

  return result
}

/**
 * Process content and replace all environment variables (SERVER ONLY)
 */
export function processContentWithEnv(content: string, config?: SpecraConfig): string {
  return replaceEnvVariables(content, config)
}

/**
 * Validate configuration (basic validation) (SERVER ONLY)
 */
export function validateConfig(config: SpecraConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!config.site?.title) {
    errors.push("site.title is required")
  }

  // URL validation
  if (config.site?.url) {
    try {
      new URL(config.site.url)
    } catch {
      errors.push("site.url must be a valid URL")
    }
  }

  // Social links validation
  if (config.social) {
    const socialKeys = ["github", "twitter", "discord", "linkedin", "youtube"] as const
    for (const key of socialKeys) {
      const url = config.social[key]
      if (url) {
        try {
          new URL(url)
        } catch {
          errors.push(`social.${key} must be a valid URL`)
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Singleton instance
let configInstance: SpecraConfig | null = null

/**
 * Initialize the Specra configuration
 * Can be called multiple times - subsequent calls will update the config
 * @param userConfig - Partial configuration to merge with defaults
 * @returns The initialized configuration
 */
export function initConfig(userConfig: Partial<SpecraConfig>): SpecraConfig {
  configInstance = loadConfig(userConfig)
  return configInstance
}

/**
 * Get the configuration instance (cached) (SERVER ONLY)
 * If not initialized, returns default config
 */
export function getConfig(): SpecraConfig {
  if (!configInstance) {
    // Auto-initialize with defaults if not already initialized
    configInstance = loadConfig({})
  }
  return configInstance
}

/**
 * Reload the configuration (useful for development) (SERVER ONLY)
 */
export function reloadConfig(userConfig: Partial<SpecraConfig>): SpecraConfig {
  configInstance = loadConfig(userConfig)
  return configInstance
}

/**
 * Load per-version configuration from docs/{version}/_version_.json.
 * Returns null if the file doesn't exist or is invalid.
 */
const versionConfigCache = new Map<string, { data: VersionConfig | null; timestamp: number }>()
const VCFG_TTL = process.env.NODE_ENV === 'development' ? 5000 : 60000

export function loadVersionConfig(version: string): VersionConfig | null {
  const cached = versionConfigCache.get(version)
  if (cached && Date.now() - cached.timestamp < VCFG_TTL) {
    return cached.data
  }

  try {
    const versionConfigPath = path.join(process.cwd(), "docs", version, "_version_.json")
    if (!fs.existsSync(versionConfigPath)) {
      versionConfigCache.set(version, { data: null, timestamp: Date.now() })
      return null
    }
    const content = fs.readFileSync(versionConfigPath, "utf8")
    const data = JSON.parse(content) as VersionConfig
    versionConfigCache.set(version, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error(`Error loading _version_.json for ${version}:`, error)
    versionConfigCache.set(version, { data: null, timestamp: Date.now() })
    return null
  }
}

/**
 * Get the effective config for a specific version.
 * Merges global config with per-version overrides from _version_.json.
 * If no _version_.json exists, returns the global config unchanged.
 */
export function getEffectiveConfig(version: string): SpecraConfig {
  const globalConfig = getConfig()
  const versionConfig = loadVersionConfig(version)

  if (!versionConfig) {
    return globalConfig
  }

  const effective = { ...globalConfig }

  if (versionConfig.tabGroups !== undefined) {
    effective.navigation = {
      ...effective.navigation,
      tabGroups: versionConfig.tabGroups,
    }
  }

  return effective
}

/**
 * Version metadata for display in the version switcher.
 */
export interface VersionMeta {
  /** Directory name (e.g., "v1.0.0") — used for routing */
  id: string
  /** Display label (e.g., "v1.0 (Stable)") — defaults to id */
  label: string
  /** Short badge text (e.g., "Beta", "LTS") */
  badge?: string
  /** Whether this version is hidden from the switcher */
  hidden?: boolean
  /** Version-level banner */
  banner?: import("./config.types").BannerConfig
}

/**
 * Get metadata for all versions, enriched with _version_.json data.
 * Hidden versions are included but marked — the UI decides whether to show them.
 */
export function getVersionsMeta(versions: string[]): VersionMeta[] {
  return versions.map(id => {
    const versionConfig = loadVersionConfig(id)
    return {
      id,
      label: versionConfig?.label || id,
      badge: versionConfig?.badge,
      hidden: versionConfig?.hidden,
      banner: versionConfig?.banner,
    }
  })
}

// ─── Product Detection & Loading ─────────────────────────────────────────────

/** Regex to detect version-like directory names (e.g., v1, v2.0.0) */
const VERSION_PATTERN = /^v\d/

/** Cache for product scanning */
const productsCache = {
  data: null as Product[] | null,
  timestamp: 0,
}

const PCFG_TTL = process.env.NODE_ENV === 'development' ? 5000 : 60000

/** Cache for individual product configs */
const productConfigCache = new Map<string, { data: ProductConfig | null; timestamp: number }>()

/**
 * Load and parse a _product_.json file for a given product slug.
 * Returns null if the file doesn't exist or is invalid.
 */
export function loadProductConfig(product: string): ProductConfig | null {
  const cached = productConfigCache.get(product)
  if (cached && Date.now() - cached.timestamp < PCFG_TTL) {
    return cached.data
  }

  try {
    const productConfigPath = path.join(process.cwd(), "docs", product, "_product_.json")
    if (!fs.existsSync(productConfigPath)) {
      productConfigCache.set(product, { data: null, timestamp: Date.now() })
      return null
    }
    const content = fs.readFileSync(productConfigPath, "utf8")
    const data = JSON.parse(content) as ProductConfig

    if (!data.label) {
      console.error(`[Specra] _product_.json in docs/${product}/ is missing required "label" field`)
      productConfigCache.set(product, { data: null, timestamp: Date.now() })
      return null
    }

    productConfigCache.set(product, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error(`[Specra] Error loading _product_.json for ${product}:`, error)
    productConfigCache.set(product, { data: null, timestamp: Date.now() })
    return null
  }
}

/**
 * Scan docs/ top-level directories for _product_.json files.
 * Returns the full list of products including the default product.
 *
 * Detection logic:
 * 1. Single readdir + stat calls — no recursive walks
 * 2. If no _product_.json found → single-product mode (returns empty array)
 * 3. If any found → multi-product mode; bare version folders become the default product
 * 4. Product slugs that match version patterns (e.g., v1.0.0) are rejected with a clear error
 */
export function scanProducts(): Product[] {
  if (productsCache.data && Date.now() - productsCache.timestamp < PCFG_TTL) {
    return productsCache.data
  }

  const docsDir = path.join(process.cwd(), "docs")
  const products: Product[] = []
  let hasExplicitProducts = false

  try {
    const entries = fs.readdirSync(docsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const productJsonPath = path.join(docsDir, entry.name, "_product_.json")
      if (!fs.existsSync(productJsonPath)) continue

      // Validate: product slugs must not look like version names
      if (VERSION_PATTERN.test(entry.name)) {
        console.error(
          `[Specra] Invalid product directory "docs/${entry.name}/": ` +
          `product slugs must not start with "v" followed by digits (looks like a version). ` +
          `Rename the directory or remove _product_.json.`
        )
        continue
      }

      const config = loadProductConfig(entry.name)
      if (config) {
        hasExplicitProducts = true
        products.push({
          slug: entry.name,
          config,
          isDefault: false,
        })
      }
    }
  } catch (error) {
    console.error("[Specra] Error scanning for products:", error)
  }

  // Only build a product list if explicit products were found
  if (!hasExplicitProducts) {
    productsCache.data = []
    productsCache.timestamp = Date.now()
    return []
  }

  // Add the default product (bare version folders)
  const globalConfig = getConfig()
  const defaultProductConfig = globalConfig.site?.defaultProduct
  const defaultProduct: Product = {
    slug: "_default_",
    config: {
      label: defaultProductConfig?.label || globalConfig.site?.title || "Docs",
      icon: defaultProductConfig?.icon,
      activeVersion: defaultProductConfig?.activeVersion || globalConfig.site?.activeVersion,
      position: -1, // Default product always first
    },
    isDefault: true,
  }

  const allProducts = [defaultProduct, ...products]
  // Sort by position (lower first), then alphabetically by label
  allProducts.sort((a, b) => {
    const posA = a.config.position ?? 999
    const posB = b.config.position ?? 999
    if (posA !== posB) return posA - posB
    return a.config.label.localeCompare(b.config.label)
  })

  productsCache.data = allProducts
  productsCache.timestamp = Date.now()
  return allProducts
}

/**
 * Get all products (cached). Returns empty array in single-product mode.
 */
export function getProducts(): Product[] {
  return scanProducts()
}

/**
 * Check if the site is in multi-product mode.
 */
export function isMultiProductMode(): boolean {
  return getProducts().length > 0
}

/**
 * Clear product-related caches. Called by file watchers when _product_.json changes.
 */
export function clearProductCaches(): void {
  productsCache.data = null
  productConfigCache.clear()
}

/**
 * Export the loaded config as default (SERVER ONLY)
 */
// export default getConfig()
