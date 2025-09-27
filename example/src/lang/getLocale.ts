export function getLocale() {
  const locale = navigator.language.toLowerCase()
  if (locale.startsWith('zh')) {
    if (
      locale.includes('tw') ||
      locale.includes('hk') ||
      locale.includes('mo')
    ) {
      return 'cht'
    } else {
      return 'chs'
    }
  }
  return 'en'
}

