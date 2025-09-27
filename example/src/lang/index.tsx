import { createLang } from 'v-locale'
import Hello from '../components/Hello.vue'
import { cht } from './cht'
import { en } from './en'
import { getLocale } from './getLocale'

export const chs = {
  country: {
    cn: '中国',
    us: '美国',
  },
  hello: '你好',
  helloUI: <Hello country="cn" />,
  helloTo: (name: string) => `你好，${name}！`,
}

export type ILang = typeof chs

export const lang = createLang(
  {
    chs,
    en,
    cht,
  },
  { default: getLocale() }
)

