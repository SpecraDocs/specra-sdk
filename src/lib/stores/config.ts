import { writable, get } from 'svelte/store'
import { getContext, setContext } from 'svelte'
import { type SpecraConfig, defaultConfig } from '../config.types'

const CONFIG_KEY = Symbol('specra-config')

/**
 * Create and set the config store in a component's context.
 * Call this in your root layout component.
 */
export function setConfigContext(config: SpecraConfig) {
  const store = writable<SpecraConfig>(config)
  setContext(CONFIG_KEY, store)
  return store
}

/**
 * Get the config store from context.
 * Must be called within a component that has a parent with setConfigContext.
 */
export function getConfigContext() {
  const store = getContext<ReturnType<typeof writable<SpecraConfig>>>(CONFIG_KEY)
  if (!store) {
    throw new Error('getConfigContext must be used within a component with setConfigContext')
  }
  return store
}

/**
 * Standalone writable config store for cases where context is not available.
 * Prefer using context-based stores (setConfigContext/getConfigContext) in components.
 */
export const configStore = writable<SpecraConfig>(defaultConfig)

/**
 * Get a specific configuration value by dot-separated path
 */
export function getConfigValue<T = unknown>(config: SpecraConfig, path: string): T | undefined {
  const keys = path.split('.')
  let value: unknown = config

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return value as T
}
