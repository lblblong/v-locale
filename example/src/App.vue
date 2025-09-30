<script setup lang="ts">
import { lang } from './lang'

// 语言按钮配置
const langs = [
  { key: 'en', label: 'English' },
  { key: 'chs', label: '简体中文' },
  { key: 'ja', label: '日語' },
] as const
</script>

<template>
  <div class="demo-page">
    <header class="demo-header">
      <h1 class="title">🌐 多语言演示</h1>
      <p class="subtitle">轻量响应式语言切换示例</p>

      <div class="lang-switch" role="group" aria-label="Language Switcher">
        <button v-for="l in langs" :key="l.key" :class="['lang-btn', { active: lang.$.lang === l.key }]"
          @click="lang.$.set(l.key, true)">
          {{ l.label }}
        </button>
      </div>
    </header>

    <main class="grid">
      <section class="block">
        <h2 class="block__title">直接访问</h2>
        <p class="code-like">lang.hello</p>
        <p class="value">{{ lang.hello }}</p>
      </section>

      <section class="block">
        <h2 class="block__title">嵌套属性</h2>
        <p class="code-like">lang.country.cn</p>
        <p class="value">{{ lang.country.cn }}</p>
      </section>

      <section class="block">
        <h2 class="block__title">组件动态切换</h2>
        <p class="code-like">&lt;component :is="lang.helloUI" /&gt;</p>
        <div class="component-preview">
          <component :is="lang.helloUI" />
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">函数返回</h2>
        <p class="code-like">lang.helloTo('Vue3')</p>
        <p class="value">{{ lang.helloTo('Vue3') }}</p>
      </section>

      <section class="block span-2">
        <h2 class="block__title">临时多语言 (一次性映射)</h2>
        <p class="code-like">lang.$.x({ chs: '…', en: '…' })</p>
        <p class="value large">
          {{
            lang.$.t({
              chs: '中午好，你吃了吗？',
              en: 'Good afternoon, have you eaten?',
              ja: 'こんにちは、ご飯は食べましたか？',
            })
          }}
        </p>
      </section>
    </main>

    <footer class="demo-footer">
      <p>当前语言：<strong>{{ lang.$.lang }}</strong></p>
      <p class="tip">演示：刷新后仍保持所选语言（localStorage 持久化）</p>
    </footer>
  </div>
</template>

<style scoped>
.demo-page {
  --c-bg: rgba(255, 255, 255, 0.07);
  --c-border: rgba(255, 255, 255, 0.15);
  --c-border-strong: rgba(255, 255, 255, 0.3);
  --c-accent: #646cff;
  --c-accent-grad: linear-gradient(92deg, #646cff, #8f6cff 55%, #b36bff);
  --c-text-dim: rgba(255, 255, 255, 0.65);
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  animation: fade-in .5s ease;
}

@media (prefers-color-scheme: light) {
  .demo-page {
    --c-bg: #ffffff;
    --c-border: #e4e8f1;
    --c-border-strong: #cfd6e2;
    --c-text-dim: #5a6573;
  }
}

.demo-header {
  text-align: center;
}

.title {
  margin: 0 0 .25rem;
  font-size: 2.4rem;
  letter-spacing: .5px;
  background: var(--c-accent-grad);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.subtitle {
  margin: 0 0 1.2rem;
  font-size: .95rem;
  color: var(--c-text-dim);
}

.lang-switch {
  display: inline-flex;
  padding: .35rem;
  gap: .35rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  backdrop-filter: blur(10px) saturate(160%);
  box-shadow: 0 4px 14px -4px rgba(0, 0, 0, .25);
}

.lang-btn {
  position: relative;
  border: 0;
  background: transparent;
  color: var(--c-text-dim);
  padding: .55rem 1.05rem;
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: .5px;
  border-radius: 999px;
  cursor: pointer;
  transition: color .25s ease;
}

.lang-btn:hover {
  color: #fff;
}

.lang-btn.active {
  color: #fff;
}

.lang-btn.active::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--c-accent-grad);
  border-radius: inherit;
  z-index: -1;
  box-shadow: 0 6px 18px -6px rgba(96, 108, 255, .55);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.4rem 1.2rem;
}

.block {
  position: relative;
  padding: 1.1rem 1.2rem 1.35rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .4rem;
  overflow: hidden;
  backdrop-filter: blur(6px) saturate(180%);
  transition: border-color .3s ease, transform .35s ease, box-shadow .35s ease;
}

.block::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(255, 255, 255, .18), rgba(255, 255, 255, 0) 40%);
  opacity: .35;
}

.block:hover {
  transform: translateY(-4px);
  border-color: var(--c-border-strong);
  box-shadow: 0 10px 28px -6px rgba(0, 0, 0, .35);
}

.block__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: #fff;
}

@media (prefers-color-scheme: light) {
  .block__title {
    color: #1e2630;
  }
}

.code-like {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: .7rem;
  opacity: .65;
  letter-spacing: .5px;
  background: rgba(0, 0, 0, .25);
  padding: .25rem .5rem;
  border-radius: 6px;
}

@media (prefers-color-scheme: light) {
  .code-like {
    background: #f0f2f5;
  }
}

.value {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.35;
}

.value.large {
  font-size: 1.15rem;
}

.component-preview {
  display: flex;
  justify-content: center;
}

.span-2 {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .span-2 {
    grid-column: span 1;
  }
}

.demo-footer {
  text-align: center;
  font-size: .8rem;
  color: var(--c-text-dim);
  display: flex;
  flex-direction: column;
  gap: .3rem;
  margin-top: .5rem;
}

.tip {
  margin: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
