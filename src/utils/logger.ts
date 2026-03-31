export const logger = {
  warn: (...message: any[]) => {
    console.warn('[vue-localeflow]', ...message)
  },
  error: (...message: any[]) => {
    console.error('[vue-localeflow]', ...message)
  },
}

