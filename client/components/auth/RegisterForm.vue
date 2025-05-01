<template>
  <div class="register-form-container">
    <h2 class="text-2xl font-bold mb-6">Inscription</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="form-group">
        <label for="username" class="block text-sm font-medium mb-1">Nom d'utilisateur</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre nom d'utilisateur"
        />
      </div>
      
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
          <span v-if="authStore.loading">Inscription en cours...</span>
          <span v-else>S'inscrire</span>
        </button>
        
        <NuxtLink to="/auth/login" class="text-sm text-blue-600 hover:underline">
          Déjà un compte ? Se connecter
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const username = ref('')
const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleSubmit = async () => {
  await authStore.register({
    username: username.value,
    email: email.value,
    password: password.value
  })
  
  // Si l'inscription réussit, rediriger vers la page d'accueil
  if (!authStore.error) {
    navigateTo('/chat')
  }
}
</script>

<style scoped>
.register-form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
