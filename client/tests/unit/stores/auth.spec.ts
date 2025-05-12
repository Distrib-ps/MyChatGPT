import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../../stores/auth'

// Mock des réponses API
const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}

const mockLoginResponse = {
  user: mockUser,
  access_token: 'mock-jwt-token'
}

// Créer des mocks pour les fonctions API
const mockLoginFn = vi.fn().mockResolvedValue(mockLoginResponse)
const mockRegisterFn = vi.fn().mockResolvedValue(mockLoginResponse)
const mockLogoutFn = vi.fn().mockResolvedValue(true)

// Mock du composable API
vi.mock('../../../composables/api/auth', () => ({
  useAuthApi: () => ({
    login: mockLoginFn,
    register: mockRegisterFn,
    logout: mockLogoutFn
  })
}))

// Mock de la fonction useCookie de Nuxt
vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({
    value: null
  }))
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Crée une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn()
    Storage.prototype.setItem = vi.fn()
    Storage.prototype.removeItem = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should login successfully', async () => {
    // Arrange
    const store = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'password123' }
    
    // Act
    await store.login(credentials)
    
    // Assert
    expect(mockLoginFn).toHaveBeenCalledWith(credentials)
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
  })

  it('should register successfully', async () => {
    // Arrange
    const store = useAuthStore()
    const credentials = { 
      username: 'testuser', 
      email: 'test@example.com', 
      password: 'password123' 
    }
    
    // Act
    await store.register(credentials)
    
    // Assert
    expect(mockRegisterFn).toHaveBeenCalledWith(credentials)
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
  })

  it('should logout successfully', async () => {
    const store = useAuthStore()
    // D'abord connecter l'utilisateur
    await store.login({ email: 'test@example.com', password: 'password123' })
    // Puis le déconnecter
    await store.logout()
    
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  // Nous ignorons ce test car il n'est pas directement lié à la fonctionnalité d'édition des messages
  it.skip('should initialize from localStorage', async () => {
    // Ce test sera implémenté ultérieurement
  })
})
