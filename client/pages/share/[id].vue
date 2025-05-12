<template>
  <div class="shared-chat-page">
    <div class="shared-header">
      <div class="app-title">MyChatGPT</div>
      <h1 class="shared-title">{{ conversation ? conversation.title : 'Conversation partagée' }}</h1>
      <div class="shared-info">
        <span v-if="conversation">Conversation partagée</span>
        <span v-else-if="loading">Chargement...</span>
        <span v-else>Conversation non trouvée</span>
      </div>
    </div>

    <div class="shared-content">
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="mt-4 text-gray-600">Chargement de la conversation...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" class="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="error-message">{{ errorMessage }}</p>
        <router-link to="/" class="home-link">Retour à l'accueil</router-link>
      </div>
      
      <div v-else-if="conversation" class="messages-container">
        <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? 'Vous' : 'Assistant' }}</span>
              <span class="message-time">{{ formatDate(message.createdAt) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
        
        <div v-if="messages.length === 0" class="no-messages">
          <p>Cette conversation ne contient pas encore de messages.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConversationsApi } from '~/composables/api/conversations'
import { useMessagesApi } from '~/composables/api/messages'

const route = useRoute()
const shareId = ref(route.params.id)
const conversation = ref(null)
const messages = ref([])
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')

const conversationsApi = useConversationsApi()
const messagesApi = useMessagesApi()

onMounted(async () => {
  await fetchSharedConversation()
})

const fetchSharedConversation = async () => {
  loading.value = true
  error.value = false
  
  try {
    // Récupérer la conversation partagée
    conversation.value = await conversationsApi.getSharedConversation(shareId.value)
    
    // Si la conversation existe, récupérer ses messages
    if (conversation.value && conversation.value.id) {
      messages.value = await messagesApi.getMessages(conversation.value.id)
    }
  } catch (err) {
    console.error('Erreur lors du chargement de la conversation partagée:', err)
    error.value = true
    errorMessage.value = 'Cette conversation n\'existe pas ou n\'est plus partagée.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const formatMessage = (content) => {
  // Convertir les liens en balises <a>
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return content.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}
</script>

<style scoped>
.shared-chat-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #1f2937;
}

.dark .shared-chat-page {
  background-color: #0f172a;
  color: #f1f5f9;
}

.shared-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .shared-header {
  border-bottom-color: #334155;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.dark .app-title {
  color: #60a5fa;
}

.shared-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.shared-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .shared-info {
  color: #94a3b8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.dark .loader {
  border-color: #1e293b;
  border-top-color: #3b82f6;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
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

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 100%;
}

.message.user {
  background-color: #e5e7eb;
  align-self: flex-end;
}

.dark .message.user {
  background-color: #334155;
}

.message.assistant {
  background-color: #dbeafe;
  align-self: flex-start;
}

.dark .message.assistant {
  background-color: #1e3a8a;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.message-role {
  font-weight: 600;
}

.message-time {
  color: #6b7280;
}

.dark .message-time {
  color: #94a3b8;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-text a {
  color: #3b82f6;
  text-decoration: underline;
}

.dark .message-text a {
  color: #60a5fa;
}

.no-messages {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.dark .no-messages {
  color: #94a3b8;
}
</style>
