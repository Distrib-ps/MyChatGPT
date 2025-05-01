<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo-container">
        <h1 class="text-3xl font-bold text-center mb-2">MyChatGPT</h1>
        <p class="text-gray-600 text-center mb-8">Connectez-vous pour accéder à vos conversations</p>
      </div>
      <div class="login-page">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue'

// Définir le titre de la page
useHead({
  title: 'Connexion - MyChatGPT'
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
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
