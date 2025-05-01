import { ref } from 'vue'
import axios from 'axios'
import type { LoginCredentials, RegisterCredentials, LoginResponse } from '~/types'

export const useAuthApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  const error = ref<string | null>(null)
  const loading = ref(false)

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la connexion'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<LoginResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', credentials)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<boolean> => {
    // Dans notre cas, le logout est géré côté client
    // Nous n'avons pas besoin d'appeler l'API
    return true
  }

  return {
    login,
    register,
    logout,
    error,
    loading
  }
}
