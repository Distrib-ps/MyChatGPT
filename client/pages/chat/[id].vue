<template>
  <div class="chat-page">
    <div class="sidebar">
      <ConversationList 
        :conversations="conversations" 
        :loading="loadingConversations"
        @create="createConversation"
        @select="selectConversation"
        @search="searchConversations"
        @clearSearch="clearSearch"
      />
    </div>
    <div class="main-content">
      <div v-if="loadingConversation" class="loading-container">
        <div class="loader"></div>
        <p class="mt-4 text-gray-600">Chargement de la conversation...</p>
      </div>
      
      <template v-else-if="currentConversation">
        <div class="chat-header">
          <h1 class="conversation-title">{{ currentConversation.title || 'Nouvelle conversation' }}</h1>
          <div class="actions">
            <button @click="showEditTitle = true" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="showEditTitle" class="edit-title-container">
          <input 
            v-model="editedTitle" 
            type="text" 
            class="edit-title-input"
            placeholder="Titre de la conversation"
            @keydown.enter="updateTitle"
            @keydown.esc="cancelEditTitle"
            ref="titleInputRef"
          />
          <div class="edit-title-actions">
            <button @click="updateTitle" class="save-btn">Enregistrer</button>
            <button @click="cancelEditTitle" class="cancel-btn">Annuler</button>
          </div>
        </div>
        
        <div class="search-wrapper">
          <MessageSearch 
            :conversation-id="currentConversation.id" 
            @scroll-to-message="scrollToMessage"
          />
        </div>
        
        <div class="messages-wrapper">
          <MessageList :messages="messages" :loading="sendingMessage" />
        </div>
        
        <div class="input-wrapper">
          <MessageInput :disabled="sendingMessage" @send="sendMessage" />
        </div>
      </template>
      
      <div v-else class="error-container">
        <p class="text-red-500">Conversation non trouvée</p>
        <button @click="router.push('/chat')" class="back-btn">
          Retour aux conversations
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConversationList from '~/components/chat/ConversationList.vue'
import MessageList from '~/components/chat/MessageList.vue'
import MessageInput from '~/components/chat/MessageInput.vue'
import MessageSearch from '~/components/chat/MessageSearch.vue'

import { useConversationsApi } from '~/composables/api/conversations'

const useConversations = () => {
  const conversations = ref([])
  const loadingConversations = ref(true)
  const isSearching = ref(false)
  const conversationsApi = useConversationsApi()
  
  const fetchConversations = async () => {
    loadingConversations.value = true
    try {
      conversations.value = await conversationsApi.getConversations()
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    } finally {
      loadingConversations.value = false
    }
  }
  
  const searchConversations = async (keyword) => {
    console.log('Page - Recherche de conversations avec le mot-clé:', keyword)
    isSearching.value = true
    loadingConversations.value = true
    
    try {
      // Appeler l'API de recherche
      const results = await conversationsApi.searchConversations(keyword)
      console.log(`Résultats de la recherche: ${results.length} conversations trouvées`)
      
      // Mettre à jour la liste des conversations avec les résultats de la recherche
      conversations.value = results
    } catch (error) {
      console.error(`Erreur lors de la recherche de conversations avec le mot-clé: ${keyword}`, error)
    } finally {
      loadingConversations.value = false
    }
  }
  
  const clearSearch = async () => {
    console.log('Effacement de la recherche')
    isSearching.value = false
    loadingConversations.value = true
    
    try {
      // Recharger toutes les conversations
      await fetchConversations()
    } catch (error) {
      console.error('Erreur lors du rechargement des conversations:', error)
    } finally {
      loadingConversations.value = false
    }
  }
  
  const createConversation = async () => {
    loadingConversations.value = true
    try {
      const newConversation = await conversationsApi.createConversation('Nouvelle conversation')
      await fetchConversations()
      
      // Rediriger vers la nouvelle conversation
      router.push(`/chat/${newConversation.id}`)
    } catch (error) {
      console.error('Erreur lors de la création d\'une nouvelle conversation:', error)
    } finally {
      loadingConversations.value = false
    }
  }
  
  const updateConversation = async (id, title) => {
    try {
      const updatedConversation = await conversationsApi.updateConversation(id, title)
      
      // Mettre à jour localement
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index] = updatedConversation
      }
      
      return updatedConversation
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la conversation ${id}:`, error)
      throw error
    }
  }
  
  return {
    conversations,
    loadingConversations,
    isSearching,
    fetchConversations,
    searchConversations,
    clearSearch,
    createConversation,
    updateConversation
  }
}

import { useMessagesApi } from '~/composables/api/messages'

const useMessages = (conversationId) => {
  const messages = ref([])
  const loadingMessages = ref(true)
  const sendingMessage = ref(false)
  const messagesApi = useMessagesApi()
  
  const fetchMessages = async (id) => {
    if (!id) return
    
    loadingMessages.value = true
    try {
      messages.value = await messagesApi.getMessages(id)
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    } finally {
      loadingMessages.value = false
    }
  }
  
  const sendMessage = async (content) => {
    if (!conversationId.value || !content.trim()) return
    
    try {
      // Envoyer le message utilisateur
      const userMessage = await messagesApi.sendUserMessage(conversationId.value, content)
      messages.value.push(userMessage)
      
      // Activer l'indicateur "L'IA réfléchit..."
      sendingMessage.value = true
      
      // Générer la réponse de l'IA
      const aiResponse = await messagesApi.generateAIResponse(conversationId.value)
      messages.value.push(aiResponse)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      sendingMessage.value = false
    }
  }
  
  return {
    messages,
    loadingMessages,
    sendingMessage,
    fetchMessages,
    sendMessage
  }
}

const route = useRoute()
const router = useRouter()
const conversationId = computed(() => route.params.id)

const { conversations, loadingConversations, fetchConversations, createConversation, updateConversation } = useConversations()
const { messages, loadingMessages, sendingMessage, fetchMessages, sendMessage } = useMessages(conversationId)

const currentConversation = computed(() => {
  if (!conversationId.value) return null
  return conversations.value.find(conv => conv.id === conversationId.value)
})

const loadingConversation = computed(() => {
  return loadingConversations.value
})

// Pour l'édition du titre
const showEditTitle = ref(false)
const editedTitle = ref('')
const titleInputRef = ref(null)

onMounted(async () => {
  await fetchConversations()
  await fetchMessages(conversationId.value)
})

watch(conversationId, async (newId) => {
  if (newId) {
    await fetchMessages(newId)
  }
})

watch(currentConversation, (newConversation) => {
  if (newConversation) {
    editedTitle.value = newConversation.title || ''
  }
})

const selectConversation = (id) => {
  router.push(`/chat/${id}`)
}

const updateTitle = async () => {
  if (!currentConversation.value) return
  
  try {
    // Appel API pour mettre à jour le titre sur le serveur
    await updateConversation(currentConversation.value.id, editedTitle.value)
    
    // Masquer l'éditeur de titre
    showEditTitle.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour du titre:', error)
  }
}

const cancelEditTitle = () => {
  editedTitle.value = currentConversation.value?.title || ''
  showEditTitle.value = false
}

const scrollToMessage = (messageId) => {
  console.log('Défilement vers le message:', messageId)
  // Trouver l'élément du message par son ID
  const messageElement = document.getElementById(`message-${messageId}`)
  
  if (messageElement) {
    // Faire défiler jusqu'au message
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // Ajouter une classe pour mettre en évidence le message pendant un moment
    messageElement.classList.add('highlight-message')
    
    // Retirer la classe après un délai
    setTimeout(() => {
      messageElement.classList.remove('highlight-message')
    }, 2000)
  } else {
    console.warn(`Message avec l'ID ${messageId} non trouvé dans le DOM`)
  }
}

watch(showEditTitle, async (newValue) => {
  if (newValue) {
    await nextTick()
    titleInputRef.value?.focus()
  }
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 64px - 48px); /* Hauteur totale moins header et footer */
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  transition: border-color 0.3s;
}

.dark .sidebar {
  border-right-color: #334155;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-container, .error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #2563eb;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s;
}

.dark .chat-header {
  border-bottom-color: #334155;
}

.conversation-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.dark .action-btn {
  background-color: #1e293b;
  color: #e2e8f0;
}

.action-btn:hover {
  background-color: #e5e7eb;
}

.dark .action-btn:hover {
  background-color: #334155;
}

.edit-title-container {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  transition: background-color 0.3s, border-color 0.3s;
}

.dark .edit-title-container {
  background-color: #1e293b;
  border-bottom-color: #334155;
}

.edit-title-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
}

.dark .edit-title-input {
  border-color: #475569;
  background-color: #1e293b;
  color: #e2e8f0;
}

.edit-title-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  transition: background-color 0.3s;
}

.dark .save-btn {
  background-color: #2563eb;
}

.save-btn:hover {
  background-color: #2563eb;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.dark .cancel-btn {
  background-color: #1e293b;
  color: #e2e8f0;
  border-color: #475569;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.dark .cancel-btn:hover {
  background-color: #334155;
}

.messages-wrapper {
  flex: 1;
  overflow: hidden;
}

.input-wrapper {
  border-top: 1px solid #e5e7eb;
  transition: border-color 0.3s;
}

.dark .input-wrapper {
  border-top-color: #334155;
}

.search-wrapper {
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.highlight-message {
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.1);
  }
}

.dark .highlight-message {
  animation: dark-highlight-pulse 2s ease-in-out;
}

@keyframes dark-highlight-pulse {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.2);
  }
}
</style>
