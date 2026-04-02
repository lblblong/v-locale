import type { App, Ref } from 'vue'
import { LANG_INTERNAL_API, type LangInstance, type LangStorage } from './createLang'

interface LangInternalApi<Langs extends string> {
  setExternalResolver: (resolver?: () => Ref<Langs> | undefined) => void
  setExternalStorageResolver: (resolver?: () => LangStorage<Langs> | undefined) => void
  normalizeLang: (value: Langs | null | undefined) => Langs
}

type InternalLangInstance<T extends object, L extends string> = LangInstance<T, L> & {
  [LANG_INTERNAL_API]: LangInternalApi<L>
}

export interface InstallNuxtLangOptions<Langs extends string> {
  /** Shared Nuxt state key */
  key?: string
  /** Initial language resolved for the current request */
  initialSSR?: Langs
  /** Nuxt's useState function */
  useState: (key: string, init?: () => Langs) => Ref<Langs | undefined>
  /** Persistence adapter, typically backed by cookies */
  storage?: LangStorage<Langs>
  /** Resolve the initial request language when storage is empty */
  resolveInitialLang?: () => Langs | null | undefined
}

const defaultNuxtStateKey = 'vue-localeflow:lang'
const langStateKeys = new WeakMap<object, string>()
let langStateKeySeed = 0

function getDefaultStateKey(target: object): string {
  const existingKey = langStateKeys.get(target)
  if (existingKey) {
    return existingKey
  }

  langStateKeySeed += 1
  const nextKey = `${defaultNuxtStateKey}:${langStateKeySeed}`
  langStateKeys.set(target, nextKey)
  return nextKey
}

export function installNuxtLang<T extends object, L extends string>(
  lang: LangInstance<T, L>,
  app: App,
  options: InstallNuxtLangOptions<L>
): Ref<L | undefined> {
  const internalLang = lang as InternalLangInstance<T, L>
  const internal = internalLang[LANG_INTERNAL_API]

  if (!internal) {
    throw new Error('[vue-localeflow] Nuxt bridge is unavailable for this lang instance')
  }

  const stateKey = options.key || getDefaultStateKey(internalLang as object)
  const resolveState = () => options.useState(stateKey)
  const resolveStoredLang = () => {
    return options.storage?.get()
  }

  internal.setExternalResolver(() => {
    let state: Ref<L | undefined>

    try {
      state = resolveState()
    } catch {
      return undefined
    }

    if (state.value == null) {
      return undefined
    }

    const normalized = internal.normalizeLang(state.value)
    if (state.value !== normalized) {
      state.value = normalized
    }

    return state as Ref<L>
  })

  internal.setExternalStorageResolver(() => options.storage)

  const state = options.useState(stateKey, () => {
    const stored = resolveStoredLang()
    if (stored != null) {
      return internal.normalizeLang(stored)
    }

    if (options.initialSSR != null) {
      return internal.normalizeLang(options.initialSSR)
    }

    const resolved = options.resolveInitialLang?.()
    return resolved == null
      ? internal.normalizeLang(undefined)
      : internal.normalizeLang(resolved)
  })

  if (options.initialSSR != null) {
    state.value = internal.normalizeLang(options.initialSSR)
  }

  app.use(lang, {
    initialSSR: state.value == null ? undefined : internal.normalizeLang(state.value),
    langRef: state as Ref<L>,
    storage: options.storage,
  })

  return state
}