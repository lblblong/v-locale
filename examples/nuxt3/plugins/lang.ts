import { installNuxtLang } from 'vue-localeflow/nuxt'
import { lang } from '~/lang'

export default defineNuxtPlugin((nuxtApp) => {
  const cookie = useCookie<'chs' | 'cht' | 'en'>('lang', {
    sameSite: 'lax',
  })

  installNuxtLang(lang, nuxtApp.vueApp, {
    useState,
    storage: {
      get: () => cookie.value,
      set: (value) => {
        cookie.value = value
      },
    },
    resolveInitialLang: () => {
      if (import.meta.server) {
        const headers = useRequestHeaders(['accept-language'])
        const acceptLanguage = headers['accept-language'] || ''

        if (acceptLanguage.includes('zh-CN')) return 'chs'
        if (acceptLanguage.includes('zh-TW')) return 'cht'
        if (acceptLanguage.includes('en')) return 'en'
        return undefined
      }

      if (navigator.language.startsWith('zh-CN')) return 'chs'
      if (navigator.language.startsWith('zh-TW')) return 'cht'
      if (navigator.language.startsWith('en')) return 'en'
      return undefined
    },
  })
})