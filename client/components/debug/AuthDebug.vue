<template>
  <div class="auth-debug">
    <h3 class="text-lg font-medium mb-2">Débogage Authentification</h3>
    <div class="debug-info">
      <p><strong>isAuthenticated:</strong> {{ authStore.isAuthenticated }}</p>
      <p><strong>Token (localStorage):</strong> {{ localStorageToken }}</p>
      <p><strong>Token (cookie):</strong> {{ cookieToken }}</p>
      <p><strong>Token (store):</strong> {{ authStore.token ? authStore.token.substring(0, 15) + '...' : 'null' }}</p>
    </div>
    <div class="mt-4">
      <button @click="testAuth" class="bg-blue-500 text-white px-4 py-2 rounded">
        Tester l'authentification
      </button>
    </div>
    <div v-if="testResult" class="mt-4 p-4 bg-gray-100 rounded">
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const authStore = useAuthStore()
const localStorageToken = ref('')
const cookieToken = ref('')
const testResult = ref('')

onMounted(() => {
  if (process.client) {
    localStorageToken.value = localStorage.getItem('token') || 'non défini'
    cookieToken.value = useCookie('auth_token').value || 'non défini'
  }
})

const testAuth = async () => {
  try {
    const api = useApi()
    const response = await api.get('/conversations')
    testResult.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    testResult.value = `Erreur: ${error.message}\n\nConfig: ${JSON.stringify(error.config, null, 2)}`
  }
}
</script>

<style scoped>
.auth-debug {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.25rem;
}
</style>
