import { logger } from './logger'

export const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (error) {
    logger.warn('Failed to read from localStorage:', error)
  }
  return null
}

export const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
  } catch (error) {
    logger.warn('Failed to write to localStorage:', error)
  }
}

