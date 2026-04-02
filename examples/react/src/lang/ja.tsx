import { ILang } from '.'
import Hello from '../components/Hello.vue'

export const ja: ILang = {
  country: {
    cn: '中国',
    us: 'アメリカ',
  },
  hello: 'こんにちは',
  helloUI: <Hello country="cn" />,
  helloTo: (name: string) => `こんにちは、${name}さん！`,
}
