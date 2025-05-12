<template>
  <div class="shared-index-page">
    <h1>Conversations partagées</h1>
    <p>Cette page liste les conversations qui ont été partagées avec vous.</p>
    
    <div class="info-box">
      <p>Pour accéder à une conversation partagée, utilisez le lien qui vous a été fourni.</p>
    </div>
    
    <div class="actions">
      <router-link to="/" class="home-link">Retour à l'accueil</router-link>
    </div>
  </div>
</template>

<script setup>
// Cette page sert principalement à s'assurer que la route /share est correctement reconnue par Nuxt.js
</script>

<style scoped>
.shared-index-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #1f2937;
}

.dark .shared-index-page {
  background-color: #0f172a;
  color: #f1f5f9;
}

h1 {
  font-size: 1.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1.5rem;
}

.info-box {
  background-color: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 0.25rem;
}

.dark .info-box {
  background-color: #1e3a8a;
  border-left-color: #60a5fa;
}

.actions {
  margin-top: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #2563eb;
}
</style>
