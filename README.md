# v-locale

<p align="center">
  <img src="https://img.shields.io/npm/v/v-locale" alt="NPM Version">
  <img src="https://img.shields.io/npm/dm/v-locale" alt="NPM Downloads">
  <img src="https://img.shields.io/github/license/lblblong/v-locale" alt="License">
  <img src="https://img.shields.io/bundlephobia/minzip/v-locale" alt="Bundle Size">
</p>

一个轻量级、类型安全的 Vue 3 国际化（i18n）解决方案，提供响应式的语言切换和本地存储支持。支持任意数据类型，包括字符串、对象、组件和函数。

[English](README.en.md) | 中文

## ✨ 特性

- 🚀 **轻量级** - 压缩后<1KB，不到 100 行代码
- 💪 **类型安全** - 完整的 TypeScript 支持，编译时类型检查
- ⚡ **高性能** - 无额外的函数调用开销，直接访问响应式对象
- 💾 **持久化** - 自动持久化多语言设置，刷新后保持语言选择
- 🎯 **简单易用** - 极简的 API 设计，三分钟上手
- 🌍 **多类型支持** - 支持字符串、对象、Vue 组件、函数等任意类型

## 📦 安装

```bash
# npm
npm install v-locale

# yarn
yarn add v-locale

# pnpm
pnpm add v-locale
```

## 🚀 快速开始

### 基础用法

```typescript
import { createLang } from 'v-locale'

// 定义语言数据（支持任意类型）
const langData = {
  chs: {
    hello: '你好',
    country: {
      cn: '中国',
      us: '美国',
    },
  },
  en: {
    hello: 'Hello',
    country: {
      cn: 'China',
      us: 'United States',
    },
  },
}

// 创建语言管理器
const lang = createLang(langData, { default: 'chs' })

// 使用语言数据
console.log(lang.hello) // '你好'
console.log(lang.country.cn) // '中国'
console.log(lang.lang) // 'chs' (当前语言键)

// 切换语言
lang.set('en')
console.log(lang.hello) // 'Hello'
console.log(lang.country.cn) // 'China'
```

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <!-- 语言切换按钮 -->
    <div class="lang-switcher">
      <button
        v-for="l in langs"
        :key="l.key"
        @click="lang.$.set(l.key)"
        :class="{ active: lang.$.lang === l.key }"
      >
        {{ l.label }}
      </button>
    </div>

    <!-- 直接访问语言数据 -->
    <h1>{{ lang.hello }}</h1>
    <p>{{ lang.country.cn }}</p>

    <!-- 当前语言显示 -->
    <p>当前语言：{{ lang.$.lang }}</p>
  </div>
</template>

<script setup lang="ts">
import { createLang } from 'v-locale'

const langData = {
  chs: {
    hello: '你好，世界！',
    country: { cn: '中国', us: '美国' },
  },
  en: {
    hello: 'Hello, World!',
    country: { cn: 'China', us: 'United States' },
  },
  cht: {
    hello: '你好，世界！',
    country: { cn: '中國', us: '美國' },
  },
}

const lang = createLang(langData, { default: 'chs' })

const langs = [
  { key: 'chs', label: '简体中文' },
  { key: 'en', label: 'English' },
  { key: 'cht', label: '繁體中文' },
]
</script>
```

### 支持多种数据类型

```typescript
import { createLang } from 'v-locale'
import HelloComponent from './components/Hello.vue'

const lang = createLang({
  chs: {
    // 字符串
    title: '欢迎',
    // 嵌套对象
    country: {
      cn: '中国',
      us: '美国',
    },
    // Vue 组件
    helloUI: <HelloComponent country="cn" />,
    // 函数
    helloTo: (name: string) => `你好，${name}！`,
  },
  en: {
    title: 'Welcome',
    country: {
      cn: 'China',
      us: 'United States',
    },
    helloUI: <HelloComponent country="en" />,
    helloTo: (name: string) => `Hello, ${name}!`,
  },
})

// 使用不同类型的数据
console.log(lang.title) // 字符串
console.log(lang.country.cn) // 嵌套对象
console.log(lang.helloTo('Vue')) // 函数调用
// 在模板中使用组件：<component :is="lang.helloUI" />
```

### 使用 `x` 函数进行临时多语言映射

```typescript
// x 函数用于一次性的多语言映射，无需预定义
const message = lang.$.x({
  chs: '中午好，你吃了吗？',
  en: 'Good afternoon, have you eaten?',
  cht: '中午好，你吃了嗎？',
})

// 根据当前语言返回对应的值
console.log(message) // 根据 lang.lang 返回对应语言的文本
```

## 📚 API 参考

### `createLang(langs, options?)`

创建一个语言管理器实例。

#### 参数

- `langs` - 语言数据对象，键为语言标识，值为该语言的数据对象（支持任意类型）
- `options` - 可选配置项
  - `default` - 默认语言键，如果未指定则使用第一个语言
  - `storageKey` - localStorage 存储键名，默认为 `'v-locale'`

#### 返回值

返回一个只读的响应式代理对象，包含以下属性和方法：

- `$` - 语言管理器对象，包含以下属性和方法：
  - `lang` - 当前激活的语言键（只读）
  - `set(key, persist?)` - 设置当前语言
    - `key` - 要设置的语言键
    - `persist` - 是否持久化到 localStorage，默认为 `true`
  - `x(options)` - 根据当前语言动态选择值
    - `options` - 包含所有语言键对应值的对象
    - 返回值 - 根据当前语言返回对应的值
- `...langData` - 当前语言的所有数据属性（通过 Proxy 动态代理访问）

## 🔧 高级用法

### TypeScript 类型安全

```typescript
// 定义语言数据类型
const chs = {
  nav: {
    home: '首页',
    about: '关于我们',
    contact: '联系我们',
  },
  message: {
    welcome: '欢迎访问我们的网站！',
    error: '发生了错误',
  },
  format: {
    date: 'YYYY年MM月DD日',
    currency: '¥',
  },
} as const

export type ILang = typeof chs

// 其他语言必须符合同样的类型
const en: ILang = {
  nav: {
    home: 'Home',
    about: 'About Us',
    contact: 'Contact Us',
  },
  message: {
    welcome: 'Welcome to our website!',
    error: 'An error occurred',
  },
  format: {
    date: 'MM/DD/YYYY',
    currency: '$',
  },
}

export const lang = createLang({ chs, en }, { default: 'chs' })

// 现在享受完整的类型提示和检查
console.log(lang.nav.home) // 类型安全的属性访问
console.log(lang.format.date) // 编译时类型检查
```

### 函数和组件支持

```typescript
import MyComponent from './MyComponent.vue'

const lang = createLang({
  chs: {
    // 支持函数
    greet: (name: string) => `你好，${name}！`,
    formatPrice: (price: number) => `¥${price.toFixed(2)}`,
    // 支持 Vue 组件
    headerComponent: <MyComponent theme="dark" />,
    footerComponent: <MyComponent theme="light" />,
  },
  en: {
    greet: (name: string) => `Hello, ${name}!`,
    formatPrice: (price: number) => `$${price.toFixed(2)}`,
    headerComponent: <MyComponent theme="dark" />,
    footerComponent: <MyComponent theme="light" />,
  },
})

// 使用函数
console.log(lang.greet('Vue')) // "你好，Vue！"
console.log(lang.formatPrice(99.99)) // "¥99.99"

// 在模板中使用组件
// <component :is="lang.headerComponent" />
```

### 临时语言切换（不持久化）

```typescript
// 临时切换语言，不保存到 localStorage
lang.set('en', false)

// 刷新页面后会恢复之前保存的语言
```

### 自定义存储配置

```typescript
const lang = createLang(langData, {
  storageKey: 'my-app-language', // 自定义存储键
  default: 'chs', // 默认语言
})
```

## 🌟 最佳实践

### 1. 分离语言文件并保证类型安全

```typescript
// lang/chs.ts
export const chs = {
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    loading: '加载中...',
  },
  nav: {
    home: '首页',
    about: '关于',
    contact: '联系我们',
  },
  pages: {
    home: {
      title: '欢迎使用 v-locale',
      subtitle: '轻量级 Vue 3 国际化解决方案',
    },
  },
} as const

export type ILang = typeof chs
```

```typescript
// lang/en.ts
import type { ILang } from './chs'

export const en: ILang = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
  },
  nav: {
    home: 'Home',
    about: 'About',
    contact: 'Contact Us',
  },
  pages: {
    home: {
      title: 'Welcome to v-locale',
      subtitle: 'Lightweight Vue 3 i18n Solution',
    },
  },
}
```

```typescript
// lang/index.ts
import { createLang } from 'v-locale'
import { chs } from './chs'
import { en } from './en'

export const lang = createLang(
  { chs, en },
  {
    default: 'chs',
    storageKey: 'app-language',
  }
)

// 导出类型以供其他地方使用
export type { ILang } from './chs'
```

### 2. 任意地方使用

由于 `lang` 对象是响应式的，您可以在项目的任意地方直接导入和使用，无需额外的 Hook 或 Provider。

- 组件外使用

```typescript
import { lang } from '@/lang'

export async function fetchUserData() {
  const response = await fetch('/api/user', {
    headers: {
      'Accept-Language': lang.$.lang === 'chs' ? 'zh-CN' : 'en-US',
    },
  })

  if (!response.ok) {
    throw new Error(lang.message.error) // 直接使用当前语言的错误信息
  }

  return response.json()
}
```

- 组件内使用

```vue
<template>
  <div>{{ lang.greeting }}</div>
</template>
```

