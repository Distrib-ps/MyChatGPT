<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo-container">
        <h1 class="text-3xl font-bold text-center mb-2 dark:text-white">MyChatGPT</h1>
        <p class="text-gray-600 text-center mb-8 dark:text-gray-300">Créez un compte pour commencer à discuter</p>
      </div>
      
      <RegisterForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '~/components/auth/RegisterForm.vue'

// Définir le titre de la page
useHead({
  title: 'Inscription - MyChatGPT'
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  transition: background-color 0.3s;
}

.dark .auth-page {
  background-color: #0f172a;
}

.auth-container {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}

.logo-container {
  margin-bottom: 2rem;
}
</style>
