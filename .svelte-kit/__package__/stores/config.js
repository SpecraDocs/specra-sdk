import { writable, get } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { defaultConfig } from '../config.types';
const CONFIG_KEY = Symbol('specra-config');
/**
 * Create and set the config store in a component's context.
 * Call this in your root layout component.
 */
export function setConfigContext(config) {
    const store = writable(config);
    setContext(CONFIG_KEY, store);
    return store;
}
/**
 * Get the config store from context.
 * Must be called within a component that has a parent with setConfigContext.
 */
export function getConfigContext() {
    const store = getContext(CONFIG_KEY);
    if (!store) {
        throw new Error('getConfigContext must be used within a component with setConfigContext');
    }
    return store;
}
/**
 * Standalone writable config store for cases where context is not available.
 * Prefer using context-based stores (setConfigContext/getConfigContext) in components.
 */
export const configStore = writable(defaultConfig);
/**
 * Get a specific configuration value by dot-separated path
 */
export function getConfigValue(config, path) {
    const keys = path.split('.');
    let value = config;
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        }
        else {
            return undefined;
        }
    }
    return value;
}
