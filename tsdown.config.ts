import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/nuxt.ts'],
  deps: {
    neverBundle: ['vue'],
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  onSuccess: 'yalc push',
})
