<template>
  <div class="app-layout">
    <header v-if="authStore.isAuthenticated" class="app-header">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="logo">
          <NuxtLink to="/chat" class="text-xl font-bold text-blue-600">MyChatGPT</NuxtLink>
        </div>
        <nav class="flex items-center space-x-4">
          <NuxtLink to="/chat" class="text-gray-700 hover:text-blue-600">Conversations</NuxtLink>
          <button @click="logout" class="text-gray-700 hover:text-red-600">Déconnexion</button>
        </nav>
      </div>
    </header>
    
    <main class="app-main">
      <slot />
    </main>
    
    <footer class="app-footer">
      <div class="container mx-auto px-4 py-3 text-center text-gray-500 text-sm">
        &copy; {{ new Date().getFullYear() }} MyChatGPT - Tous droits réservés
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

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
}

.app-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.app-main {
  flex: 1;
}

.app-footer {
  background-color: white;
  border-top: 1px solid #e5e7eb;
}
</style>
