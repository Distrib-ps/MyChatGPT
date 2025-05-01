import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      // Sauvegarder la préférence dans localStorage
      if (process.client) {
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      }
    },

    initTheme() {
      if (process.client) {
        // Vérifier si l'utilisateur a déjà une préférence
        const savedTheme = localStorage.getItem('theme')
        
        if (savedTheme) {
          this.isDark = savedTheme === 'dark'
        } else {
          // Utiliser la préférence du système
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        
        this.applyTheme()
      }
    },

    applyTheme() {
      // Appliquer la classe au document
      if (process.client) {
        if (this.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }
})
