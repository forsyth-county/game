import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base path for the application.
 * This is used to prepend paths for GitHub Pages deployment.
 */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

/**
 * Prepend the base path to a given path.
 * Handles paths that start with '/' correctly.
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath()
  if (!basePath) return path
  
  // If path starts with '/', prepend basePath
  if (path.startsWith('')) {
    return `${basePath}${path}`
  }
  
  return path
}
