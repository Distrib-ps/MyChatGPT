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
  token: 'mock-jwt-token'
}

// Mock du composable API
vi.mock('../../../composables/api/auth', () => ({
  useAuthApi: () => ({
    login: vi.fn().mockResolvedValue(mockLoginResponse),
    register: vi.fn().mockResolvedValue(mockLoginResponse),
    logout: vi.fn().mockResolvedValue(true)
  })
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
    const store = useAuthStore()
    await store.login({ email: 'test@example.com', password: 'password123' })
    
    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe('mock-jwt-token')
    expect(store.isAuthenticated).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
  })

  it('should register successfully', async () => {
    const store = useAuthStore()
    await store.register({ 
      username: 'testuser', 
      email: 'test@example.com', 
      password: 'password123' 
    })
    
    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe('mock-jwt-token')
    expect(store.isAuthenticated).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
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

  it('should initialize from localStorage', async () => {
    // Mock localStorage pour retourner un token
    Storage.prototype.getItem = vi.fn().mockReturnValue('mock-jwt-token')
    
    const store = useAuthStore()
    await store.initAuth()
    
    expect(store.token).toBe('mock-jwt-token')
    expect(store.isAuthenticated).toBe(true)
  })
})
