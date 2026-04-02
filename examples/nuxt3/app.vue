<script setup lang="ts">
import { computed } from 'vue'
import { lang } from '~/lang'
import { getLanguageSnapshot, getRuntimeMessage } from '~/utils/langRuntime'

const langOptions = [
  { key: 'chs', label: '简体中文' },
  { key: 'cht', label: '繁體中文' },
  { key: 'en', label: 'English' },
] as const

const cookie = useCookie<'chs' | 'cht' | 'en'>('lang', {
  sameSite: 'lax',
})

const snapshot = computed(() => getLanguageSnapshot())

const { data: asyncSnapshot, refresh } = await useAsyncData('lang-snapshot', async () => {
  return getLanguageSnapshot()
})

function switchLang(nextLang: 'chs' | 'cht' | 'en') {
  lang.$.set(nextLang)
  refresh()
}
</script>

<template>
  <main class="page-shell">
    <NuxtRouteAnnouncer />

    <section class="hero-card">
      <p class="eyebrow">vue-localeflow x Nuxt 3 SSR</p>
      <h1>{{ lang.title }}</h1>
      <p class="lead">{{ lang.description }}</p>

      <div class="actions">
        <button
          v-for="item in langOptions"
          :key="item.key"
          class="lang-button"
          :class="{ active: lang.$.lang === item.key }"
          @click="switchLang(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="grid">
      <article class="info-card">
        <h2>组件内直接读取</h2>
        <p>{{ lang.panelTitle }}</p>
        <p>{{ lang.panelBody }}</p>
      </article>

      <article class="info-card">
        <h2>普通 TS 函数读取</h2>
        <p>{{ getRuntimeMessage() }}</p>
      </article>

      <article class="info-card">
        <h2>同请求异步链读取</h2>
        <p>{{ asyncSnapshot?.message }}</p>
      </article>
    </section>

    <section class="debug-card">
      <h2>调试信息</h2>
      <dl>
        <div>
          <dt>当前 lang.$.lang</dt>
          <dd>{{ lang.$.lang }}</dd>
        </div>
        <div>
          <dt>Cookie lang</dt>
          <dd>{{ cookie || 'empty' }}</dd>
        </div>
        <div>
          <dt>Snapshot lang</dt>
          <dd>{{ snapshot.lang }}</dd>
        </div>
        <div>
          <dt>Snapshot title</dt>
          <dd>{{ snapshot.title }}</dd>
        </div>
      </dl>
      <p class="hint">
        打开两个无痕窗口分别切换语言，然后刷新页面，观察每个窗口是否保持各自语言。
      </p>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 48px 20px 64px;
  background:
    radial-gradient(circle at top left, rgba(255, 214, 153, 0.75), transparent 28%),
    radial-gradient(circle at right center, rgba(144, 197, 255, 0.5), transparent 30%),
    linear-gradient(180deg, #fff8ec 0%, #f4f7fb 100%);
  color: #142136;
  font-family: 'Avenir Next', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}

.hero-card,
.info-card,
.debug-card {
  width: min(980px, 100%);
  margin: 0 auto;
  border: 1px solid rgba(20, 33, 54, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 60px rgba(22, 35, 58, 0.08);
  backdrop-filter: blur(14px);
}

.hero-card {
  padding: 32px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #8c5a16;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(38px, 7vw, 64px);
  line-height: 1;
}

.lead {
  max-width: 56rem;
  margin: 16px 0 0;
  color: #475467;
  font-size: 18px;
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.lang-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: #edf2f7;
  color: #142136;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.lang-button:hover {
  transform: translateY(-1px);
}

.lang-button.active {
  background: #142136;
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  width: min(980px, 100%);
  margin: 18px auto 0;
}

.info-card,
.debug-card {
  padding: 24px;
}

.info-card h2,
.debug-card h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.info-card p,
.debug-card p,
.debug-card dd {
  margin: 0;
  color: #475467;
  line-height: 1.7;
}

.debug-card {
  margin-top: 18px;
}

dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

dt {
  color: #667085;
  font-size: 14px;
}

dd {
  margin-top: 4px;
  font-weight: 700;
}

.hint {
  margin-top: 18px;
  color: #8c5a16;
}

@media (max-width: 640px) {
  .page-shell {
    padding: 24px 14px 40px;
  }

  .hero-card,
  .info-card,
  .debug-card {
    border-radius: 20px;
  }

  .hero-card {
    padding: 24px;
  }
}
</style>
