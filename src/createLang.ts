import { readonly, ref } from 'vue'
import { isBrowser } from './utils/env'
import { safeGetStorage, safeSetStorage } from './utils/localStorage'
import { logger } from './utils/logger'

/**
 * Options for creating a multi-language configuration
 */
interface CreateLangOptions {
  /** localStorage key, defaults to 'v-locale' */
  storageKey?: string
  /** Default language key, defaults to the first key of langs */
  default?: string
}

/**
 * Language manager interface providing language switching and utility methods
 * @template Langs - Union type of language keys
 */
interface Core<Langs extends string> {
  /** Current language key (read-only) */
  readonly lang: Langs
  /**
   * Set the current language
   * @param val - The language key to set
   * @param persist - Whether to persist to localStorage, defaults to true
   */
  set: (val: Langs, persist?: boolean) => void
  /**
   * Get the value corresponding to the current language
   * @template V - Return value type
   * @param opts - Object containing all language keys and their corresponding values
   * @returns The value corresponding to the current language
   */
  t: <V>(opts: { [K in Langs]: V }) => V
}

/**
 * Create a reactive multi-language manager
 *
 * @template T - Type of the language data object
 * @template L - String literal union type of language keys
 *
 * @param langs - Multi-language data object, where keys are language identifiers and values are the corresponding language data
 * @param options - Configuration options
 * @param options.storageKey - localStorage key name, defaults to 'v-locale'
 * @param options.default - Default language key, defaults to the first key of langs
 *
 * @returns Returns a read-only proxy object containing:
 * - `$`: Language manager with `lang` (current language), `set` (switch language), and `t` (conditional translation) methods
 * - Other properties: Direct access to the current language's data fields
 *
 * @example
 * ```typescript
 * const lang = createLang({
 *   en: { hello: 'Hello', world: 'World' },
 *   zh: { hello: '你好', world: '世界' }
 * }, { default: 'zh' })
 *
 * console.log(lang.hello) // '你好'
 * console.log(lang.$.lang) // 'zh'
 *
 * lang.$.set('en')
 * console.log(lang.hello) // 'Hello'
 *
 * const greeting = lang.$.t({ en: 'Hi', zh: '嗨' }) // 'Hi'
 * ```
 */
export function createLang<T extends object, L extends string>(
  langs: Record<L, T>,
  options: CreateLangOptions = {}
) {
  // Validate langs is not empty
  if (!langs || typeof langs !== 'object') {
    throw new Error('[v-locale] langs must be a non-empty object')
  }

  const langKeys = Object.keys(langs) as L[]

  if (langKeys.length === 0) {
    throw new Error('[v-locale] langs must contain at least one language')
  }

  // Use Set for O(1) lookup performance
  const langKeysSet = new Set<L>(langKeys)

  const storageKey = options.storageKey || 'v-locale'

  const getInitialLang = (): L => {
    if (isBrowser) {
      const stored = safeGetStorage(storageKey) as L | null
      if (stored && langKeysSet.has(stored)) {
        return stored
      }
    }

    // Validate default language if provided
    if (options.default) {
      if (!langKeysSet.has(options.default as L)) {
        logger.warn(
          `Default language "${options.default}" not found in langs, using "${langKeys[0]}"`
        )
        return langKeys[0]
      }
      return options.default as L
    }

    return langKeys[0]
  }

  const initialLang = getInitialLang()
  const lang = ref(initialLang) as import('vue').Ref<L>

  const $ = {
    get lang(): L {
      return lang.value
    },
    set: (val: L, persist = true) => {
      if (!langKeysSet.has(val)) {
        logger.warn(`Invalid language key: ${String(val)}`)
        return
      }
      lang.value = val

      if (persist && isBrowser) {
        safeSetStorage(storageKey, String(val))
      }
    },
    t: <V>(opts: { [K in L]: V }): V => {
      return opts[lang.value]
    },
  }

  return readonly(
    new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === '$') return $

          // Handle Vue 3 internal symbols and common built-in symbols
          if (typeof prop === 'symbol') {
            // Let Vue's reactivity system handle these
            if (prop === Symbol.toStringTag) return 'LangProxy'
            // Return undefined for other symbols to prevent errors
            return undefined
          }

          const currentData = langs[lang.value]
          if (currentData && Reflect.has(currentData, prop)) {
            return Reflect.get(currentData, prop)
          }

          return undefined
        },

        // Support 'in' operator
        has(_, prop) {
          if (prop === '$') return true

          if (typeof prop === 'symbol') return false

          const currentData = langs[lang.value]
          return currentData ? Reflect.has(currentData, prop) : false
        },

        // Support Object.keys(), Object.entries(), etc.
        ownKeys(_) {
          const currentData = langs[lang.value]
          if (!currentData) return ['$']

          const keys = Reflect.ownKeys(currentData)
          return ['$', ...keys]
        },

        // Required for ownKeys to work properly
        getOwnPropertyDescriptor(_, prop) {
          if (prop === '$') {
            return {
              configurable: true,
              enumerable: true,
              value: $,
            }
          }

          const currentData = langs[lang.value]
          if (currentData && Reflect.has(currentData, prop)) {
            return Reflect.getOwnPropertyDescriptor(currentData, prop)
          }

          return undefined
        },
      }
    )
  ) as Readonly<{ $: Core<L> } & T>
}

