export const logger = {
  warn: (...message: any[]) => {
    console.warn('[vue-locale]', ...message)
  },
  error: (...message: any[]) => {
    console.error('[vue-locale]', ...message)
  },
}

