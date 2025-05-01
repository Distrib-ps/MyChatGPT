<template>
  <div class="login-form-container">
    <h2 class="text-2xl font-bold mb-6">Connexion</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="form-group">
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre email"
        />
      </div>
      
      <div class="form-group">
        <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre mot de passe"
        />
      </div>
      
      <div v-if="authStore.error" class="error-message text-red-500 text-sm mt-2">
        {{ authStore.error }}
      </div>
      
      <div class="flex items-center justify-between mt-4">
        <button 
          type="submit" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </button>
        
        <a href="/auth/register" class="text-sm text-blue-600 hover:underline">
          Créer un compte
        </a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleSubmit = async () => {
  await authStore.login({
    email: email.value,
    password: password.value
  })
  
  // Si la connexion réussit, rediriger vers la page d'accueil
  if (!authStore.error && process.client) {
    // Utiliser window.location pour la redirection dans les tests
    if (typeof navigateTo === 'function') {
      navigateTo('/chat')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/chat'
    }
  }
}
</script>

<style scoped>
.login-form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
