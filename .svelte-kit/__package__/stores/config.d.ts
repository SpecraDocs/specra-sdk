import { type SpecraConfig } from '../config.types';
/**
 * Create and set the config store in a component's context.
 * Call this in your root layout component.
 */
export declare function setConfigContext(config: SpecraConfig): import("svelte/store").Writable<SpecraConfig>;
/**
 * Get the config store from context.
 * Must be called within a component that has a parent with setConfigContext.
 */
export declare function getConfigContext(): import("svelte/store").Writable<SpecraConfig>;
/**
 * Standalone writable config store for cases where context is not available.
 * Prefer using context-based stores (setConfigContext/getConfigContext) in components.
 */
export declare const configStore: import("svelte/store").Writable<SpecraConfig>;
/**
 * Get a specific configuration value by dot-separated path
 */
export declare function getConfigValue<T = unknown>(config: SpecraConfig, path: string): T | undefined;
