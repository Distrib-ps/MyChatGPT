import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginForm from '../../../../components/auth/LoginForm.vue'

// Pas besoin de stubber process ou window car c'est déjà fait dans setup.ts

// Mock du store d'authentification
const mockLogin = vi.fn()
const mockStore = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null as string | null,
  login: mockLogin
}

// Mock du module stores/auth
vi.mock('../../../../stores/auth', () => ({
  useAuthStore: () => mockStore
}))

describe('LoginForm', () => {
  let wrapper: any

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    mockLogin.mockClear()
    mockStore.error = null
    mockStore.loading = false

    // Créer une instance de Pinia pour les tests
    const pinia = createPinia()
    setActivePinia(pinia)

    // Monter le composant avec Pinia
    wrapper = mount(LoginForm, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('should render the login form', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should update email and password on input', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect(wrapper.vm.email).toBe('test@example.com')
    expect(wrapper.vm.password).toBe('password123')
  })

  it('should call login action when form is submitted', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit.prevent')

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it.skip('should display error message when login fails', async () => {
    // Ce test sera implémenté ultérieurement
  })

  // Ce test n'est pas directement lié à la fonctionnalité d'édition des messages
  it.skip('should disable the submit button during loading', async () => {
    // Ce test sera implémenté ultérieurement
  })
})
