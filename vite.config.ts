import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    })
  ],
  build: {
    lib: {
      fileName: 'index',
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})

