<template>
  <div class="chat-page">
    <div class="sidebar">
      <div v-if="isDeletingConversation" class="loading-banner">
        Suppression en cours...
      </div>
      <ConversationList 
        :conversations="conversations" 
        :loading="loadingConversations"
        @create="createConversation"
        @select="selectConversation"
        @search="searchConversations"
        @clearSearch="clearSearch"
        @delete="deleteConversation"
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
            <button @click="showEditTitle = true" class="action-btn" title="Modifier le titre">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click="toggleShareDialog" class="action-btn" title="Partager la conversation">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
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
        
        <!-- Boîte de dialogue de partage -->
        <div v-if="showShareDialog" class="share-dialog-container">
          <div class="share-dialog">
            <div class="share-dialog-header">
              <h3 class="share-dialog-title">Partager cette conversation</h3>
              <button @click="toggleShareDialog" class="close-btn" title="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div v-if="isGeneratingShareId" class="share-loading">
              <div class="loader"></div>
              <p>Génération du lien de partage...</p>
            </div>
            
            <div v-else-if="shareId" class="share-content">
              <p class="share-info">Utilisez ce lien pour partager cette conversation :</p>
              
              <div class="share-link-container">
                <input 
                  type="text" 
                  readonly 
                  ref="shareLinkInput"
                  class="share-link-input"
                  :value="fullShareLink"
                />
                <button @click="copyToClipboard" class="copy-btn">
                  <span v-if="!linkCopied">Copier</span>
                  <span v-else>Copié !</span>
                </button>
              </div>
              
              <div class="share-actions">
                <button @click="removeShareLink" class="cancel-share-btn">
                  Supprimer le partage
                </button>
              </div>
            </div>
            
            <div v-else class="share-content">
              <p class="share-info">Voulez-vous générer un lien de partage pour cette conversation ?</p>
              <div class="share-actions">
                <button @click="generateShareLink" class="generate-btn">Générer un lien</button>
                <button @click="toggleShareDialog" class="cancel-btn">Annuler</button>
              </div>
            </div>
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
import { useMessagesApi } from '~/composables/api/messages'

// Définition des routes et du router
const route = useRoute()
const router = useRouter()
const conversationId = computed(() => route.params.id)

// Composable pour gérer les conversations
const useConversations = () => {
  const conversations = ref([])
  const loadingConversations = ref(true)
  const isSearching = ref(false)
  const isDeletingConversation = ref(false)
  const showShareDialog = ref(false)
  const shareId = ref(null)
  const isGeneratingShareId = ref(false)
  const linkCopied = ref(false)
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
      await conversationsApi.updateConversation(id, title)
      // Mettre à jour le titre dans la liste des conversations
      const index = conversations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        conversations.value[index].title = title
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la conversation ${id}:`, error)
    }
  }
  
  // Fonction principale de suppression
  const deleteConversation = async (id) => {
    console.log(`Page - Début de la suppression de la conversation: ${id}`)
    console.log('Type de l\'ID:', typeof id, 'Valeur:', id)
    
    // Vérifier que l'ID est valide
    if (!id) {
      console.error('ID de conversation invalide')
      return
    }
    
    // Pas de confirmation requise
    console.log(`Suppression de la conversation ${id} en cours...`)
    
    isDeletingConversation.value = true
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé')
      }
      
      const response = await fetch(`http://localhost:3000/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Réponse de l\'API:', response)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }
      
      // Supprimer la conversation de la liste locale
      conversations.value = conversations.value.filter(c => c.id !== id)
      
      // Si la conversation supprimée est la conversation actuelle, rediriger vers la page principale
      if (conversationId.value === id) {
        console.log('Redirection vers la page principale après suppression de la conversation actuelle')
        router.push('/chat')
      }
      
    } catch (error) {
      console.error(`Erreur lors de la suppression de la conversation ${id}:`, error)
    } finally {
      isDeletingConversation.value = false
    }
  }
  
  const generateShare = async (id) => {
    if (!id) return
    
    isGeneratingShareId.value = true
    linkCopied.value = false
    
    try {
      const generatedShareId = await conversationsApi.generateShareId(id)
      shareId.value = generatedShareId
      console.log(`ID de partage généré: ${generatedShareId}`)
    } catch (error) {
      console.error('Erreur lors de la génération du lien de partage:', error)
    } finally {
      isGeneratingShareId.value = false
    }
  }
  
  const removeShare = async (id) => {
    if (!id) return
    
    try {
      await conversationsApi.removeShareId(id)
      shareId.value = null
      console.log('Lien de partage supprimé')
    } catch (error) {
      console.error('Erreur lors de la suppression du lien de partage:', error)
    }
  }
  
  const toggleShareDialog = () => {
    showShareDialog.value = !showShareDialog.value
    // Réinitialiser l'état de copie lorsque la boîte de dialogue est ouverte/fermée
    linkCopied.value = false
  }
  
  const copyShareLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        linkCopied.value = true
        setTimeout(() => {
          linkCopied.value = false
        }, 2000)
      })
      .catch(err => {
        console.error('Erreur lors de la copie du lien:', err)
      })
  }

  return {
    conversations,
    loadingConversations,
    isSearching,
    isDeletingConversation,
    showShareDialog,
    shareId,
    isGeneratingShareId,
    linkCopied,
    fetchConversations,
    searchConversations,
    clearSearch,
    createConversation,
    updateConversation,
    deleteConversation,
    generateShare,
    removeShare,
    toggleShareDialog,
    copyShareLink
  }
}

// Composable pour gérer les messages
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

// Initialisation des composables
const { 
  conversations, 
  loadingConversations, 
  isDeletingConversation,
  showShareDialog,
  shareId,
  isGeneratingShareId,
  linkCopied,
  fetchConversations, 
  searchConversations,
  clearSearch,
  createConversation, 
  updateConversation,
  deleteConversation,
  generateShare,
  removeShare,
  toggleShareDialog,
  copyShareLink
} = useConversations()

const { 
  messages, 
  loadingMessages, 
  sendingMessage, 
  fetchMessages, 
  sendMessage 
} = useMessages(conversationId)

// Computed properties
const currentConversation = computed(() => {
  if (!conversationId.value) return null
  return conversations.value.find(conv => conv.id === conversationId.value)
})

const loadingConversation = computed(() => {
  return loadingConversations.value
})

// Propriété calculée pour le lien de partage complet
const fullShareLink = computed(() => {
  if (!shareId.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${shareId.value}`
})

// Pour l'édition du titre
const showEditTitle = ref(false)
const editedTitle = ref('')
const titleInputRef = ref(null)

// Lifecycle hooks
onMounted(async () => {
  await fetchConversations()
  await fetchMessages(conversationId.value)
})

// Watchers
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

watch(showEditTitle, async (newValue) => {
  if (newValue) {
    await nextTick()
    titleInputRef.value?.focus()
  }
})

// Méthodes
const selectConversation = (id) => {
  router.push(`/chat/${id}`)
}

const updateTitle = async () => {
  console.log('Début de la fonction updateTitle')
  console.log('currentConversation:', currentConversation.value)
  console.log('editedTitle:', editedTitle.value)
  
  if (!currentConversation.value) {
    console.error('Conversation actuelle non définie')
    return
  }
  
  try {
    console.log('Appel de updateConversation avec ID:', currentConversation.value.id, 'et titre:', editedTitle.value)
    // Appel API pour mettre à jour le titre sur le serveur
    await updateConversation(currentConversation.value.id, editedTitle.value)
    
    // Masquer l'éditeur de titre
    showEditTitle.value = false
    console.log('Mise à jour du titre réussie')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du titre:', error)
  }
}

const cancelEditTitle = () => {
  showEditTitle.value = false
  editedTitle.value = ''
}

// Méthodes pour le partage de conversation
const generateShareLink = async () => {
  if (!currentConversation.value) return
  await generateShare(currentConversation.value.id)
}

const removeShareLink = async () => {
  if (!currentConversation.value) return
  await removeShare(currentConversation.value.id)
  // Fermer la boîte de dialogue après la suppression
  showShareDialog.value = false
}

const copyToClipboard = () => {
  copyShareLink(fullShareLink.value)
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

/* Styles pour la boîte de dialogue de partage */
.share-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.share-dialog {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .share-dialog {
  background-color: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
}

.share-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.share-dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dark .share-dialog-title {
  color: #f1f5f9;
}

.close-btn {
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

.dark .close-btn {
  background-color: #1e293b;
  color: #e2e8f0;
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.dark .close-btn:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.share-info {
  margin-bottom: 1rem;
  color: #4b5563;
}

.dark .share-info {
  color: #cbd5e1;
}

.share-link-container {
  display: flex;
  margin-bottom: 1rem;
}

.share-link-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px 0 0 4px;
  background-color: #f9fafb;
  color: #1f2937;
}

.dark .share-link-input {
  background-color: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #2563eb;
}

.share-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.generate-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover {
  background-color: #2563eb;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.dark .cancel-btn {
  background-color: #1e293b;
  color: #e2e8f0;
  border-color: #334155;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.dark .cancel-btn:hover {
  background-color: #334155;
}

.cancel-share-btn {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-share-btn:hover {
  background-color: #dc2626;
}

.share-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}
</style>