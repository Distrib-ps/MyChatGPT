import { defineStore } from 'pinia'
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '~/types'
import { useAuthApi } from '~/composables/api/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null
      
      try {
        const authApi = useAuthApi()
        const response = await authApi.login(credentials)
        
        this.user = response.user
        this.token = response.access_token
        this.isAuthenticated = true
        
        // Stocker le token dans localStorage et dans un cookie
        localStorage.setItem('token', response.access_token)
        const tokenCookie = useCookie('auth_token')
        tokenCookie.value = response.access_token
      } catch (error: any) {
        this.error = typeof error === 'string' ? error : 'Erreur lors de la connexion'
      } finally {
        this.loading = false
      }
    },
    
    async register(credentials: RegisterCredentials) {
      this.loading = true
      this.error = null
      
      try {
        const authApi = useAuthApi()
        const response = await authApi.register(credentials)
        
        this.user = response.user
        this.token = response.access_token
        this.isAuthenticated = true
        
        // Stocker le token dans localStorage et dans un cookie
        localStorage.setItem('token', response.access_token)
        const tokenCookie = useCookie('auth_token')
        tokenCookie.value = response.access_token
      } catch (error: any) {
        this.error = typeof error === 'string' ? error : 'Erreur lors de l\'inscription'
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      this.loading = true
      this.error = null
      
      try {
        const authApi = useAuthApi()
        await authApi.logout()
        
        // Réinitialiser l'état
        this.user = null
        this.token = null
        this.isAuthenticated = false
        
        // Supprimer le token du localStorage et du cookie
        localStorage.removeItem('token')
        const tokenCookie = useCookie('auth_token')
        tokenCookie.value = null
      } catch (error: any) {
        this.error = typeof error === 'string' ? error : 'Erreur lors de la déconnexion'
      } finally {
        this.loading = false
      }
    },
    
    async initAuth() {
      // Récupérer le token du localStorage
      const token = localStorage.getItem('token')
      
      if (token) {
        this.token = token
        this.isAuthenticated = true
        
        // Mettre à jour le cookie
        const tokenCookie = useCookie('auth_token')
        tokenCookie.value = token
        
        // TODO: Implémenter la récupération des informations utilisateur
        // à partir du token (appel à /auth/me par exemple)
      }
    }
  }
})
