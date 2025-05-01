import { useRuntimeConfig } from 'nuxt/app'
import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  
  // Créer une instance axios
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // Intercepteur pour ajouter le token à chaque requête
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Récupérer le token directement du localStorage
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })
  
  return api
}
