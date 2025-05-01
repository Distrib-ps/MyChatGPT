<template>
  <div class="app-layout">
    <header v-if="authStore.isAuthenticated" class="app-header">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="logo">
          <NuxtLink to="/chat" class="text-xl font-bold text-blue-600">MyChatGPT</NuxtLink>
        </div>
        <nav class="flex items-center space-x-4">
          <NuxtLink to="/chat" class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Conversations</NuxtLink>
          <button @click="logout" class="logout-button">Déconnexion</button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
    
    <main class="app-main">
      <slot />
    </main>
    
    <footer class="app-footer">
      <div class="container mx-auto px-4 py-3 text-center text-gray-500 text-sm dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} MyChatGPT - Tous droits réservés
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import ThemeToggle from '~/components/common/ThemeToggle.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

// Initialiser le thème au chargement de la page
onMounted(() => {
  themeStore.initTheme()
})

const logout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

.app-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.dark .app-header {
  background-color: #0f172a;
  border-bottom-color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.app-main {
  flex: 1;
}

.app-footer {
  background-color: white;
  border-top: 1px solid #e5e7eb;
  transition: background-color 0.3s, border-color 0.3s;
}

.dark .app-footer {
  background-color: #0f172a;
  border-top-color: #334155;
  color: #e2e8f0;
}

.logout-button {
  background-color: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  transition: color 0.3s;
}

.logout-button:hover {
  color: #2563eb;
}

.dark .logout-button {
  color: #e2e8f0;
}

.dark .logout-button:hover {
  color: #60a5fa;
}
</style>
