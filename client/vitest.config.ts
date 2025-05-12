import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    deps: {
      inline: ['vue', '@vue/test-utils']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    mockReset: false,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname),
      '@': resolve(__dirname),
      '#app': resolve(__dirname, 'node_modules/nuxt/dist/app'),
      '#vue-router': resolve(__dirname, 'node_modules/vue-router'),
      '#imports': resolve(__dirname, '.nuxt/imports.d.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.client': true,
    'process.server': false,
  },
})
