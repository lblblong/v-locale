import { ILang } from '.'
import Hello from '../components/Hello.vue'

export const en: ILang = {
  country: {
    cn: 'China',
    us: 'United States',
  },
  hello: 'Hello',
  helloUI: <Hello country="en" />,
  helloTo: (name: string) => `Hello, ${name}!`,
}

