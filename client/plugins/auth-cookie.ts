import { defineNuxtPlugin } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Récupérer le token du localStorage
  if (process.client) {
    const token = localStorage.getItem('token')
    
    if (token) {
      // Mettre à jour le cookie avec le token
      const tokenCookie = useCookie('auth_token')
      tokenCookie.value = token
      
      // Mettre à jour le store
      authStore.token = token
      authStore.isAuthenticated = true
    }
  }
})
