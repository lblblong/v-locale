import {
  hasInjectionContext,
  inject,
  readonly,
  ref,
  type App,
  type InjectionKey,
  type Ref,
} from 'vue'
import { isBrowser } from './utils/env'
import { safeGetStorage, safeSetStorage } from './utils/localStorage'
import { logger } from './utils/logger'

/**
 * Options for creating a multi-language configuration
 */
export interface CreateLangOptions<Langs extends string = string> {
  /** localStorage key, defaults to 'vue-localeflow' */
  storageKey?: string
  /** Default language key, defaults to the first key of langs */
  default?: Langs
  /** Custom persistence adapter */
  storage?: LangStorage<Langs>
  /** Resolve the initial language when no persisted value exists */
  resolveInitialLang?: ResolveInitialLang<Langs>
}

export interface LangPluginOptions<Langs extends string = string> {
  /** Initial language used when installing into an SSR app instance */
  initialSSR?: Langs
  /** Existing request-scoped ref provided by an adapter layer */
  langRef?: Ref<Langs>
  /** Persistence adapter used for this app instance */
  storage?: LangStorage<Langs>
}

export interface LangStorage<Langs extends string = string> {
  get: () => Langs | null | undefined
  set: (value: Langs) => void
}

export interface ResolveInitialLangContext<Langs extends string> {
  isBrowser: boolean
  defaultLang: Langs
  langKeys: readonly Langs[]
}

export type ResolveInitialLang<Langs extends string> = (
  context: ResolveInitialLangContext<Langs>
) => Langs | null | undefined

/**
 * Language manager interface providing language switching and utility methods
 * @template Langs - Union type of language keys
 */
export interface Core<Langs extends string> {
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
   * @param opts - Object containing language keys and their corresponding values
   * @returns The value corresponding to the current language
   */
  t: <V>(opts: Partial<Record<Langs, V>>) => V
}

interface LangInternalApi<Langs extends string> {
  setExternalResolver: (resolver?: () => Ref<Langs> | undefined) => void
  setExternalStorageResolver: (resolver?: () => LangStorage<Langs> | undefined) => void
  resolveActiveLangRef: () => Ref<Langs>
  normalizeLang: (value: Langs | null | undefined) => Langs
}

interface LangRuntimeContext<Langs extends string> {
  langRef: Ref<Langs>
  storage?: LangStorage<Langs>
}

export const LANG_INTERNAL_API = Symbol('vue-localeflow-internal-api')

export type LangInstance<T extends object, L extends string> = Readonly<
  { $: Core<L>; install: (app: App, options?: LangPluginOptions<L>) => void } & T
>

/**
 * Create a reactive multi-language manager
 *
 * @template T - Type of the language data object
 * @template L - String literal union type of language keys
 *
 * @param langs - Multi-language data object, where keys are language identifiers and values are the corresponding language data
 * @param options - Configuration options
 * @param options.storageKey - localStorage key name, defaults to 'vue-localeflow'
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
  options: CreateLangOptions<L> = {}
): LangInstance<T, L> {
  // Validate langs is not empty
  if (!langs || typeof langs !== 'object') {
    throw new Error('[vue-localeflow] langs must be a non-empty object')
  }

  const langKeys = Object.keys(langs) as L[]

  if (langKeys.length === 0) {
    throw new Error('[vue-localeflow] langs must contain at least one language')
  }

  // Use Set for O(1) lookup performance
  const langKeysSet = new Set<L>(langKeys)

  const storageKey = options.storageKey || 'vue-localeflow'

  const defaultStorage = isBrowser
    ? {
        get: () => safeGetStorage(storageKey) as L | null,
        set: (value: L) => {
          safeSetStorage(storageKey, String(value))
        },
      }
    : undefined

  const baseStorage = options.storage || defaultStorage

  const fallbackLang = (() => {
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
  })()

  const normalizeLang = (value: L | null | undefined, warn = true): L => {
    if (value && langKeysSet.has(value)) {
      return value
    }

    if (warn && value != null) {
      logger.warn(`Invalid language key: ${String(value)}`)
    }

    return fallbackLang
  }

  const readStoredLang = (storage?: LangStorage<L>): L | undefined => {
    if (!storage) {
      return undefined
    }

    const stored = storage.get()
    if (stored == null) {
      return undefined
    }

    return normalizeLang(stored)
  }

  const getInitialLang = (): L => {
    const storedLang = readStoredLang(baseStorage)
    if (storedLang) {
      return storedLang
    }

    const resolvedLang = options.resolveInitialLang?.({
      isBrowser,
      defaultLang: fallbackLang,
      langKeys,
    })

    if (resolvedLang != null) {
      return normalizeLang(resolvedLang)
    }

    return fallbackLang
  }

  const initialLang = getInitialLang()
  const globalLangRef = ref(initialLang) as Ref<L>
  const langInjectionKey = Symbol('vue-localeflow-context') as InjectionKey<
    LangRuntimeContext<L>
  >

  let externalResolver: (() => Ref<L> | undefined) | undefined
  let externalStorageResolver: (() => LangStorage<L> | undefined) | undefined

  const getInjectedContext = (): LangRuntimeContext<L> | undefined => {
    if (!hasInjectionContext()) {
      return undefined
    }

    return inject(langInjectionKey, undefined)
  }

  const getInjectedLangRef = (): Ref<L> | undefined => {
    return getInjectedContext()?.langRef
  }

  const getActiveStorage = (): LangStorage<L> | undefined => {
    return getInjectedContext()?.storage || externalStorageResolver?.() || baseStorage
  }

  const getExternalLangRef = (): Ref<L> | undefined => {
    if (!externalResolver) {
      return undefined
    }

    const resolved = externalResolver()
    if (!resolved) {
      return undefined
    }

    const normalized = normalizeLang(resolved.value)
    if (resolved.value !== normalized) {
      resolved.value = normalized
    }

    return resolved
  }

  const getActiveLangRef = (): Ref<L> => {
    return getInjectedLangRef() || getExternalLangRef() || globalLangRef
  }

  const resolveTranslation = <V>(opts: Partial<Record<L, V>>): V => {
    const activeLang = getActiveLangRef().value
    const currentValue = opts[activeLang]
    if (currentValue !== undefined) {
      return currentValue
    }

    if (options.default) {
      const defaultValue = opts[options.default as L]
      if (defaultValue !== undefined) {
        return defaultValue
      }
    }

    for (const key of langKeys) {
      const fallbackValue = opts[key]
      if (fallbackValue !== undefined) {
        return fallbackValue
      }
    }

    return undefined as V
  }

  const internalApi: LangInternalApi<L> = {
    setExternalResolver: (resolver) => {
      externalResolver = resolver
    },
    setExternalStorageResolver: (resolver) => {
      externalStorageResolver = resolver
    },
    resolveActiveLangRef: getActiveLangRef,
    normalizeLang: (value) => normalizeLang(value, false),
  }

  const install = (app: App, pluginOptions: LangPluginOptions<L> = {}) => {
    const requestLangRef = (pluginOptions.langRef ||
      ref(normalizeLang(pluginOptions.initialSSR ?? globalLangRef.value, false))) as Ref<L>

    requestLangRef.value = normalizeLang(
      pluginOptions.initialSSR ?? requestLangRef.value ?? globalLangRef.value,
      false
    )

    app.provide(langInjectionKey, {
      langRef: requestLangRef,
      storage: pluginOptions.storage || baseStorage,
    })

    if (isBrowser) {
      globalLangRef.value = requestLangRef.value
    }
  }

  const $ = {
    get lang(): L {
      return getActiveLangRef().value
    },
    set: (val: L, persist = true) => {
      if (!langKeysSet.has(val)) {
        logger.warn(`Invalid language key: ${String(val)}`)
        return
      }

      const activeLangRef = getActiveLangRef()
      activeLangRef.value = val

      if (isBrowser) {
        globalLangRef.value = val
      }

      if (persist) {
        getActiveStorage()?.set(val)
      }
    },
    t: <V>(opts: Partial<Record<L, V>>): V => {
      return resolveTranslation(opts)
    },
  }

  return readonly(
    new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === '$') return $
          if (prop === 'install') return install
          if (prop === LANG_INTERNAL_API) return internalApi

          // Handle Vue 3 internal symbols and common built-in symbols
          if (typeof prop === 'symbol') {
            // Let Vue's reactivity system handle these
            if (prop === Symbol.toStringTag) return 'LangProxy'
            // Return undefined for other symbols to prevent errors
            return undefined
          }

          const currentData = langs[getActiveLangRef().value]
          if (currentData && Reflect.has(currentData, prop)) {
            return Reflect.get(currentData, prop)
          }

          return undefined
        },

        // Support 'in' operator
        has(_, prop) {
          if (prop === '$') return true
          if (prop === 'install') return true
          if (prop === LANG_INTERNAL_API) return true

          if (typeof prop === 'symbol') return false

          const currentData = langs[getActiveLangRef().value]
          return currentData ? Reflect.has(currentData, prop) : false
        },

        // Support Object.keys(), Object.entries(), etc.
        ownKeys(_) {
          const currentData = langs[getActiveLangRef().value]
          if (!currentData) return ['$', 'install']

          const keys = Reflect.ownKeys(currentData)
          return ['$', 'install', ...keys]
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

          if (prop === 'install') {
            return {
              configurable: true,
              enumerable: true,
              value: install,
            }
          }

          if (prop === LANG_INTERNAL_API) {
            return {
              configurable: true,
              enumerable: false,
              value: internalApi,
            }
          }

          const currentData = langs[getActiveLangRef().value]
          if (currentData && Reflect.has(currentData, prop)) {
            return Reflect.getOwnPropertyDescriptor(currentData, prop)
          }

          return undefined
        },
      }
    )
  ) as LangInstance<T, L>
}

