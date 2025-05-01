import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Initialiser l'authentification uniquement côté client
  if (process.client) {
    const authStore = useAuthStore()
    
    // Initialiser l'authentification à partir du localStorage
    await authStore.initAuth()
  }
})
