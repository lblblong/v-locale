# v-locale

<p align="center">
  <img src="https://img.shields.io/npm/v/v-locale" alt="NPM Version">
  <img src="https://img.shields.io/npm/dm/v-locale" alt="NPM Downloads">
  <img src="https://img.shields.io/github/license/your-username/v-locale" alt="License">
  <img src="https://img.shields.io/bundlephobia/minzip/v-locale" alt="Bundle Size">
</p>

A lightweight, type-safe Vue 3 internationalization (i18n) solution with reactive language switching and localStorage support.

English | [中文](README.md)

## ✨ Features

- 🚀 **Lightweight** - Only a few KB when compressed
- 💪 **Type Safe** - Full TypeScript support
- ⚡ **Reactive** - Built on Vue 3's reactive system
- 💾 **Persistent** - Auto-save to localStorage
- 🎯 **Simple** - Minimal API design
- 🔧 **Zero Config** - Works out of the box with optional configuration

## 📦 Installation

```bash
# npm
npm install v-locale

# yarn
yarn add v-locale

# pnpm
pnpm add v-locale
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createLang } from 'v-locale'

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
console.log(lang.hello) // Outputs hello in current language
console.log(lang.lang)  // Outputs current language key
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
        @click="lang.set(key)"
        :class="{ active: lang.lang === key }"
      >
        {{ key }}
      </button>
    </div>
    
    <p>{{ lang.hello }}, {{ lang.world }}!</p>
  </div>
</template>

<script setup>
import { createLang } from 'v-locale'

const langData = {
  en: { greeting: 'Welcome', hello: 'Hello', world: 'World' },
  zh: { greeting: '欢迎', hello: '你好', world: '世界' },
  ja: { greeting: 'いらっしゃいませ', hello: 'こんにちは', world: '世界' }
}

const lang = createLang(langData, { default: 'en' })
</script>
```

### Using the `x` Function for Dynamic Selection

```typescript
const lang = createLang({
  en: { name: 'English' },
  zh: { name: '中文' },
  ja: { name: '日本語' }
})

// Use x function to dynamically select values based on current language
const buttonText = lang.x({
  en: 'Click me',
  zh: '点击我',
  ja: 'クリックして'
})

const colors = lang.x({
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
  - `default` - Default language key, uses the first language if not specified
  - `storageKey` - localStorage key name, defaults to `'v-locale'`

#### Returns

Returns a readonly reactive object with the following properties and methods:

- `lang` - Currently active language key (readonly)
- `set(key, persist?)` - Set current language
  - `key` - Language key to set
  - `persist` - Whether to persist to localStorage, defaults to `true`
- `x(options)` - Dynamically select value based on current language
  - `options` - Object containing values for all language keys
- `...langData` - All data properties of current language (via Proxy)

### Type Definitions

```typescript
interface CreateLangOptions<T> {
  storageKey?: string
  default?: T
}

interface Lang<Langs> {
  readonly lang: keyof Langs
  set: (val: keyof Langs, persist?: boolean) => void
  x: <V>(opts: { [K in keyof Langs]: V }) => V
}
```

## 🔧 Advanced Usage

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
// Temporarily switch language without saving to localStorage
lang.set('zh', false)
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
import { createLang } from 'v-locale'

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
    isEn: computed(() => lang.lang === 'en'),
    isZh: computed(() => lang.lang === 'zh'),
    switchLang: (key: string) => lang.set(key)
  }
}
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

Thanks to all contributors for their support!