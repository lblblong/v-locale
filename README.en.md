# vue-localeflow

<p align="center">
  <img src="https://img.shields.io/npm/v/vue-localeflow" alt="NPM Version">
  <img src="https://img.shields.io/npm/dm/vue-localeflow" alt="NPM Downloads">
  <img src="https://img.shields.io/github/license/your-username/vue-localeflow" alt="License">
  <img src="https://img.shields.io/bundlephobia/minzip/vue-localeflow" alt="Bundle Size">
</p>

A lightweight, type-safe Vue 3 internationalization (i18n) solution with reactive language switching and pluggable persistence.

English | [中文](README.md)

## ✨ Features

- 🚀 **Lightweight** - Only a few KB when compressed
- 💪 **Type Safe** - Full TypeScript support
- ⚡ **Reactive** - Built on Vue 3's reactive system
- 💾 **Persistent** - Auto-save with localStorage by default, or use custom persistence
- 🎯 **Simple** - Minimal API design
- 🔧 **Zero Config** - Works out of the box with optional configuration

## 📦 Installation

```bash
# npm
npm install vue-localeflow

# yarn
yarn add vue-localeflow

# pnpm
pnpm add vue-localeflow
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createLang } from 'vue-localeflow'

// Define your language data
const langData = {
  en: {
    hello: 'Hello',
    world: 'World',
    greeting: 'Hello, World!'
  },
  zh: {
    hello: '你好',
    world: '世界',
    greeting: '你好，世界！'
  },
  ja: {
    hello: 'こんにちは',
    world: '世界',
    greeting: 'こんにちは、世界！'
  }
}

// Create language manager
const lang = createLang(langData, {
  default: 'en',
  storageKey: 'my-app-lang'
})

// Use in your application
console.log(lang.hello)   // Outputs hello in current language
console.log(lang.$.lang)  // Outputs current language key
```

### Use in Vue Components

```vue
<template>
  <div>
    <h1>{{ lang.greeting }}</h1>
    
    <div>
      <button 
        v-for="key in ['en', 'zh', 'ja']" 
        :key="key"
        @click="lang.$.set(key)"
        :class="{ active: lang.$.lang === key }"
      >
        {{ key }}
      </button>
    </div>
    
    <p>{{ lang.hello }}, {{ lang.world }}!</p>
  </div>
</template>

<script setup>
import { createLang } from 'vue-localeflow'

const langData = {
  en: { greeting: 'Welcome', hello: 'Hello', world: 'World' },
  zh: { greeting: '欢迎', hello: '你好', world: '世界' },
  ja: { greeting: 'いらっしゃいませ', hello: 'こんにちは', world: '世界' }
}

const lang = createLang(langData, { default: 'en' })
</script>
```

### Using the `t` Function for Dynamic Selection

```typescript
const lang = createLang({
  en: { name: 'English' },
  zh: { name: '中文' },
  ja: { name: '日本語' }
})

// Use t function to dynamically select values based on current language
const buttonText = lang.$.t({
  en: 'Click me',
  zh: '点击我',
  ja: 'クリックして'
})

const colors = lang.$.t({
  en: 'red',
  zh: 'blue', 
  ja: 'green'
})
```

## 📚 API Reference

### `createLang(langs, options?)`

Creates a language manager instance.

#### Parameters

- `langs` - Language data object where keys are language identifiers and values are data objects for that language
- `options` - Optional configuration
  - `default` - Default language key, uses the first language declared in `langs` if not specified; invalid values also fall back to that first language
  - `storageKey` - localStorage key name, defaults to `'vue-localeflow'`
  - `storage` - Custom persistence adapter, useful for cookies or other storage backends
  - `resolveInitialLang` - Custom function used to decide the initial language when nothing is persisted

#### Returns

Returns a readonly proxy object with the following properties and methods:

- `$` - Language manager object
  - `lang` - Currently active language key (readonly)
  - `set(key, persist?)` - Set current language
  - `t(options)` - Dynamically select a value based on the current language
- `...langData` - All data properties of the current language (via Proxy)

### Type Definitions

```typescript
interface CreateLangOptions<T> {
  storageKey?: string
  default?: T
  storage?: {
    get: () => T | null | undefined
    set: (value: T) => void
  }
  resolveInitialLang?: () => T | null | undefined
}

interface Lang<Langs> {
  readonly lang: keyof Langs
  set: (val: keyof Langs, persist?: boolean) => void
  t: <V>(opts: Partial<Record<keyof Langs, V>>) => V
}
```

## 🔧 Advanced Usage

### Nuxt SSR Integration

No extra configuration is needed for SPA usage.

For Nuxt SSR, use the `vue-localeflow/nuxt` entry in a Nuxt plugin so each request gets its own language state:

```typescript
// plugins/lang.ts
import { installNuxtLang } from 'vue-localeflow/nuxt'
import { lang } from '~/lang'

export default defineNuxtPlugin((nuxtApp) => {
  const cookie = useCookie<'en' | 'zh'>('lang')

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

        if (acceptLanguage.includes('zh')) return 'zh'
        if (acceptLanguage.includes('en')) return 'en'
        return undefined
      }

      return navigator.language.startsWith('zh') ? 'zh' : 'en'
    },
  })
})
```

If you only need browser-language based initialization in an SPA, pass `resolveInitialLang` directly to `createLang()`:

```typescript
const lang = createLang(langData, {
  default: 'en',
  resolveInitialLang: () => {
    if (navigator.language.startsWith('zh')) return 'zh'
    if (navigator.language.startsWith('en')) return 'en'
    return undefined
  },
})
```

After that, application code can keep using the globally exported `lang` object:

```typescript
export function getPageTitle() {
  return lang.title
}
```

Avoid caching request-scoped values at module top level during SSR:

```typescript
// Not recommended
export const pageTitle = lang.title
```

That pattern evaluates too early and can escape the current request context.

### Complex Language Data Structure

```typescript
const lang = createLang({
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      contact: 'Contact'
    },
    messages: {
      welcome: 'Welcome to our site!',
      error: 'Something went wrong'
    },
    formats: {
      date: 'MM/DD/YYYY',
      currency: '$'
    }
  },
  zh: {
    nav: {
      home: '首页',
      about: '关于',
      contact: '联系'
    },
    messages: {
      welcome: '欢迎访问我们的网站！',
      error: '出现了错误'
    },
    formats: {
      date: 'YYYY年MM月DD日',
      currency: '¥'
    }
  }
})

// Access nested properties
console.log(lang.nav.home)        // 'Home' or '首页'
console.log(lang.formats.date)    // 'MM/DD/YYYY' or 'YYYY年MM月DD日'
```

### Temporary Switch Without Persistence

```typescript
// Temporarily switch language without persisting it
lang.$.set('zh', false)
```

### Custom Storage Key

```typescript
const lang = createLang(langData, {
  storageKey: 'my-custom-lang-key',
  default: 'zh'
})
```

## 🌟 Best Practices

### 1. Create Language Constants

```typescript
// lang/constants.ts
export const LANG_KEYS = {
  EN: 'en',
  ZH: 'zh',
  JA: 'ja'
} as const

export type LangKey = typeof LANG_KEYS[keyof typeof LANG_KEYS]
```

### 2. Separate Language Files

```typescript
// lang/en.ts
export default {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  pages: {
    home: {
      title: 'Welcome Home'
    }
  }
}

// lang/zh.ts
export default {
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认'
  },
  pages: {
    home: {
      title: '欢迎回家'
    }
  }
}

// lang/index.ts
import en from './en'
import zh from './zh'
import { createLang } from 'vue-localeflow'

export const lang = createLang({ en, zh }, {
  default: 'en',
  storageKey: 'app-language'
})
```

### 3. Create Composable

```typescript
// composables/useLang.ts
import { lang } from '@/lang'

export function useLang() {
  return {
    lang,
    isEn: computed(() => lang.$.lang === 'en'),
    isZh: computed(() => lang.$.lang === 'zh'),
    switchLang: (key: string) => lang.$.set(key as 'en' | 'zh')
  }
}
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

Thanks to all contributors for their support!