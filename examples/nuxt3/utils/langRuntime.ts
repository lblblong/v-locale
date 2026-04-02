import { lang } from '~/lang'

export function getRuntimeMessage(): string {
  return lang.runtimeMessage
}

export function getLanguageSnapshot() {
  return {
    lang: lang.$.lang,
    title: lang.title,
    message: getRuntimeMessage(),
  }
}