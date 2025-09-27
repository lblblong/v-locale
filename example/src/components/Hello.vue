<template>
  <div class="card" :class="`card--${country}`">
    <div class="greeting">
      <span class="text">{{ lang.hello }} {{ country }}</span>
      <span class="emoji" aria-hidden="true">🖐🏻</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { lang } from '../lang'


defineProps<{
  country: 'en' | 'cn'
}>()

</script>

<style scoped>
.card {
  max-width: 340px;
  margin: 1.25rem auto;
  padding: 1.25rem 1.4rem;
  background: linear-gradient(145deg, #ffffff, #f3f6fa); /* default fallback */
  border: 1px solid #e5eaf0;
  border-radius: 18px;
  box-shadow: 0 4px 10px -2px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04);
  transition: box-shadow .28s ease, transform .28s ease, background .5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Country specific gradient themes */
.card--cn {
  background: linear-gradient(135deg,#fff5f6,#ffe1e4 45%,#ffd5c2 90%);
  border-color: #ffc9d0;
}

.card--en {
  background: linear-gradient(135deg,#e3f2ff,#d2e5ff 50%,#f0f7ff 95%);
  border-color: #c3dcf5;
}

/* Optional dark-mode tweaks */
@media (prefers-color-scheme: dark) {
  .card { background: linear-gradient(145deg,#1f2730,#2a3642); border-color:#32424f; }
  .card--cn { background: linear-gradient(135deg,#402f33,#5a3a3f 50%,#704c3d 95%); border-color:#804f55; }
  .card--en { background: linear-gradient(135deg,#1e2f40,#243b52 50%,#2f475d 95%); border-color:#3d5872; }
  .greeting { color:#e9eef3; }
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06);
}

.greeting {
  gap: .75rem;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: .5px;
  text-transform: uppercase;
}

.text {
  background: linear-gradient(90deg,#1d3557,#264b7f);
  background-clip: text; /* Standard */
  -webkit-background-clip: text; /* Safari / Chrome */
  color: transparent;
  color: #fff;
}

.emoji {
  font-size: 2.75rem;
  line-height: 1;
  display: inline-flex;
  transform-origin: center;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.15));
  animation: wave 2.4s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg) scale(1); }
  15% { transform: rotate(18deg) scale(1.05); }
  30% { transform: rotate(-10deg) scale(1.05); }
  45% { transform: rotate(12deg) scale(1.05); }
  60% { transform: rotate(-6deg) scale(1.03); }
  75% { transform: rotate(4deg) scale(1.02); }
}
</style>