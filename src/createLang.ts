import { readonly, ref } from 'vue'

interface CreateLangOptions {
  /** localStorage key, defaults to 'v-locale' */
  storageKey?: string
  /** Default language key, defaults to the first key of langs */
  default?: string
}

interface Lang<Langs extends string> {
  readonly lang: Langs
  set: (val: Langs, persist?: boolean) => void
  x: <V>(opts: { [K in Langs]: V }) => V
}

export function createLang<T extends object, L extends string>(
  langs: Record<L, T>,
  options: CreateLangOptions = {}
) {
  const storageKey = options.storageKey || 'v-locale'
  const langKeys = Object.keys(langs)

  const initialLang: L = (((typeof localStorage !== 'undefined' &&
    localStorage.getItem(storageKey)) as L | null) ||
    options.default ||
    langKeys[0]) as L

  const lang = ref(initialLang) as import('vue').Ref<L>

  const $ = {
    get lang(): L {
      return lang.value
    },
    set: (val: L, persist = true) => {
      if (!langKeys.includes(val as string)) {
        console.warn(`[createLang] Invalid language key: ${String(val)}`)
        return
      }
      lang.value = val
      if (persist && typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, String(val))
      }
    },
    x: <V>(opts: { [K in L]: V }): V => {
      return opts[lang.value]
    },
  }

  const langProxy = new Proxy({} as any, {
    get(_, prop) {
      if (prop === '$') return $

      const currentData = langs[lang.value]
      if (currentData && Reflect.has(currentData, prop)) {
        return Reflect.get(currentData, prop)
      }
    },
  })

  return readonly(langProxy) as Readonly<
    {
      $: Lang<L>
    } & T
  >
}
