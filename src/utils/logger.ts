export const logger = {
  warn: (...message: any[]) => {
    console.warn('[v-locale]', ...message)
  },
  error: (...message: any[]) => {
    console.error('[v-locale]', ...message)
  },
}

