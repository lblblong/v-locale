import { createLang } from 'vue-localeflow'

export const lang = createLang(
  {
    chs: {
      title: '当前页面正在使用简体中文',
      description:
        '这个 Nuxt 3 示例会在组件内、普通 TypeScript 函数里，以及异步数据链里同时读取同一个全局导出的 lang。',
      panelTitle: '这是组件模板直接读取的文本。',
      panelBody: '如果 SSR 没有串语言，这里会始终和当前窗口保持一致。',
      runtimeMessage: '这段话来自普通 TypeScript 文件中的函数调用。',
    },
    cht: {
      title: '目前頁面正在使用繁體中文',
      description:
        '這個 Nuxt 3 範例會在元件內、普通 TypeScript 函式，以及非同步資料鏈裡同時讀取同一個全域匯出的 lang。',
      panelTitle: '這是元件模板直接讀取的文字。',
      panelBody: '如果 SSR 沒有串語言，這裡會一直和目前視窗保持一致。',
      runtimeMessage: '這段話來自普通 TypeScript 檔案中的函式呼叫。',
    },
    en: {
      title: 'This page is currently using English',
      description:
        'This Nuxt 3 example reads the same globally exported lang from the component, plain TypeScript utilities, and an async data chain.',
      panelTitle: 'This text is read directly inside the component template.',
      panelBody: 'If SSR isolation works, it should always match the current browser window.',
      runtimeMessage: 'This sentence comes from a plain TypeScript utility function.',
    },
  },
  {
    default: 'en',
  }
)