/**
 * Check if code is running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
