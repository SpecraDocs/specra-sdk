import { SpecraConfig } from "./config.types";
/**
 * Load and parse the Specra configuration file
 * Falls back to default configuration if file doesn't exist or is invalid
 */
export declare function loadConfig(userConfig: Partial<SpecraConfig>): SpecraConfig;
/**
 * Get a specific configuration value by path (SERVER ONLY)
 * Example: getConfigValue('site.title') or getConfigValue('theme.defaultMode')
 */
export declare function getConfigValue<T = any>(path: string, config?: SpecraConfig): T | undefined;
/**
 * Replace environment variables in a string (SERVER ONLY)
 * Supports ${ENV_VAR} and {{ENV_VAR}} syntax
 */
export declare function replaceEnvVariables(text: string, config?: SpecraConfig): string;
/**
 * Process content and replace all environment variables (SERVER ONLY)
 */
export declare function processContentWithEnv(content: string, config?: SpecraConfig): string;
/**
 * Validate configuration (basic validation) (SERVER ONLY)
 */
export declare function validateConfig(config: SpecraConfig): {
    valid: boolean;
    errors: string[];
};
/**
 * Initialize the Specra configuration
 * Can be called multiple times - subsequent calls will update the config
 * @param userConfig - Partial configuration to merge with defaults
 * @returns The initialized configuration
 */
export declare function initConfig(userConfig: Partial<SpecraConfig>): SpecraConfig;
/**
 * Get the configuration instance (cached) (SERVER ONLY)
 * If not initialized, returns default config
 */
export declare function getConfig(): SpecraConfig;
/**
 * Reload the configuration (useful for development) (SERVER ONLY)
 */
export declare function reloadConfig(userConfig: Partial<SpecraConfig>): SpecraConfig;
/**
 * Export the loaded config as default (SERVER ONLY)
 */
