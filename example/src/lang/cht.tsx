import { ILang } from '.'
import Hello from '../components/Hello.vue'

export const cht: ILang = {
  country: {
    cn: '中國',
    us: '美國',
  },
  hello: '你好',
  helloUI: <Hello country="cn" />,
  helloTo: (name: string) => `你好，${name}！`,
}

