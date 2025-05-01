<template>
  <div class="home-page">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  // Attendre un court instant pour s'assurer que l'authentification est initialisée
  setTimeout(() => {
    // Rediriger en fonction de l'état d'authentification
    if (authStore.isAuthenticated) {
      navigateTo('/chat')
    } else {
      navigateTo('/auth/login')
    }
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading-container {
  text-align: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
