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
  color: #1e293b;
  transition: background-color 0.3s, color 0.3s;
}

/* Mode sombre */
html.dark body {
  background-color: #0f172a;
  color: #e2e8f0;
}

/* Styles pour les éléments communs en mode sombre */
.dark .app-header {
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
}

.dark .app-footer {
  background-color: #1e293b;
  border-top: 1px solid #334155;
}

.dark .logo a {
  color: #3b82f6;
}

.dark .card,
.dark .message-bubble {
  background-color: #1e293b;
  border-color: #334155;
}

.dark input,
.dark textarea,
.dark select {
  background-color: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.dark input::placeholder,
.dark textarea::placeholder {
  color: #64748b;
}

/* Styles spécifiques pour les boutons d'action */
.dark .action-button {
  background-color: #2563eb;
  color: white;
}

.dark .action-button:hover {
  background-color: #1d4ed8;
}
</style>
