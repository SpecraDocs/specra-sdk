import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Get the correct asset path based on deployment configuration.
 * Uses SvelteKit's base path (from kit.paths.base) which is resolved
 * from deployment.basePath in specra.config.json or the BASE_PATH env var.
 *
 * @param assetPath - The asset path (can start with or without '/')
 * @returns The properly formatted asset path with base prefix
 */
export function getAssetPath(assetPath: string): string {
  const basePath = process.env.BASE_PATH || ''

  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`

  if (basePath) {
    const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`
    const cleanBase = normalizedBase.replace(/\/$/, '')
    return `${cleanBase}${normalizedPath}`
  }

  return normalizedPath
}