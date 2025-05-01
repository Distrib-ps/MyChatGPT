import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Si on est côté client
  if (process.client) {
    const authStore = useAuthStore()
    
    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
    if (!authStore.isAuthenticated && !to.path.startsWith('/auth/')) {
      // Rediriger vers la page de connexion
      return navigateTo('/auth/login')
    }
    
    // Si l'utilisateur est authentifié et essaie d'accéder à une page d'authentification
    if (authStore.isAuthenticated && to.path.startsWith('/auth/')) {
      // Rediriger vers la page d'accueil
      return navigateTo('/chat')
    }
  }
})
