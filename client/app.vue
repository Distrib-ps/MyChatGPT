<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Initialiser l'authentification au démarrage de l'application
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Initialiser l'authentification si on est côté client
onMounted(async () => {
  if (process.client) {
    await authStore.initAuth()
  }
})
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f9fafb;
}
</style>
