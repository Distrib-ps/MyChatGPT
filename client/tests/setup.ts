import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock des hooks de Vue
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn((fn) => fn()),
    onUnmounted: vi.fn(),
    onBeforeMount: vi.fn(),
    onBeforeUnmount: vi.fn(),
    onActivated: vi.fn(),
    onDeactivated: vi.fn(),
    onBeforeUpdate: vi.fn(),
    onUpdated: vi.fn(),
    onErrorCaptured: vi.fn(),
  }
})

// Mock de Nuxt
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(() => ({
    $router: {
      push: vi.fn(),
      replace: vi.fn(),
    },
  })),
  defineNuxtPlugin: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiBaseUrl: 'http://localhost:3000',
    },
  })),
}))

// Mock de Vue Router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { id: 'test-id' },
    path: '/test-path',
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}))

// Configuration globale pour Vue Test Utils
config.global.mocks = {
  $route: {
    params: { id: 'test-id' },
    path: '/test-path',
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  },
}

// Mock de localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock de process.env
process.env = {
  ...process.env,
  NODE_ENV: 'test',
}

// Nettoyage global après chaque test
afterEach(() => {
  vi.clearAllMocks()
})
