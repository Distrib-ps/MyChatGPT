<template>
  <div class="chat-page">
    <div class="sidebar">
      <ConversationList 
        :conversations="conversations" 
        :loading="loadingConversations"
        @create="createConversation"
        @select="selectConversation"
        @delete="deleteConversation"
        @search="searchConversations"
        @clearSearch="clearSearch"
      />
    </div>
    <div class="main-content">
      <div class="chat-welcome">
        <div class="welcome-content">
          <h1 class="text-2xl font-bold mb-4">Bienvenue sur MyChatGPT</h1>
          <p class="mb-6 text-gray-600">Sélectionnez une conversation existante ou créez-en une nouvelle pour commencer à discuter avec l'IA.</p>
          <button 
            @click="createConversation" 
            class="new-chat-btn"
            :disabled="loadingConversations"
          >
            <span v-if="loadingConversations">Chargement...</span>
            <span v-else>Nouvelle conversation</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ConversationList from '~/components/chat/ConversationList.vue'

import { useConversationsApi } from '~/composables/api/conversations'

const useConversations = () => {
  const conversations = ref([])
  const loadingConversations = ref(true)
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
  
  const createConversation = async () => {
    loadingConversations.value = true
    try {
      const newConversation = await conversationsApi.createConversation()
      conversations.value = [newConversation, ...conversations.value]
      return newConversation
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
      return null
    } finally {
      loadingConversations.value = false
    }
  }
  
  const deleteConversation = async (id) => {
    console.log(`Index Page - Début de la suppression de la conversation: ${id}`)
    console.log('Type de l\'ID:', typeof id, 'Valeur:', id)
    console.log('conversationsApi disponible:', !!conversationsApi, conversationsApi)
    
    // Vérifier que l'ID est valide
    if (!id) {
      console.error('ID de conversation invalide')
      return
    }
    
    loadingConversations.value = true
    
    try {
      console.log('Avant appel API deleteConversation')
      // Appel direct avec fetch pour déboguer
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
      
      console.log('Index Page - Suppression réussie, mise à jour de la liste')
      // Mettre à jour la liste des conversations après la suppression
      conversations.value = conversations.value.filter(c => c.id !== id)
      
      // Afficher un message de succès
      alert('Conversation supprimée avec succès')
    } catch (error) {
      console.error(`Erreur lors de la suppression de la conversation ${id}:`, error)
      // Afficher un message d'erreur
      alert(`Erreur lors de la suppression de la conversation: ${error.message || 'Erreur inconnue'}`)
    } finally {
      loadingConversations.value = false
    }
  }

  const searchConversations = async (keyword) => {
    console.log(`Index Page - Recherche de conversations avec le mot-clé: ${keyword}`)
    loadingConversations.value = true
    try {
      conversations.value = await conversationsApi.searchConversations(keyword)
    } catch (error) {
      console.error('Erreur lors de la recherche de conversations:', error)
    } finally {
      loadingConversations.value = false
    }
  }

  const clearSearch = async () => {
    console.log('Index Page - Effacement de la recherche')
    // Recharger toutes les conversations
    fetchConversations()
  }

  return {
    conversations,
    loadingConversations,
    fetchConversations,
    createConversation,
    deleteConversation,
    searchConversations,
    clearSearch
  }
}

const router = useRouter()
const { conversations, loadingConversations, fetchConversations, createConversation, deleteConversation, searchConversations, clearSearch } = useConversations()

onMounted(async () => {
  await fetchConversations()
})

const selectConversation = (id) => {
  router.push(`/chat/${id}`)
}

const createAndRedirect = async () => {
  const newConversation = await createConversation()
  if (newConversation) {
    router.push(`/chat/${newConversation.id}`)
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
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-welcome {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-content {
  max-width: 500px;
  text-align: center;
}

.new-chat-btn {
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.new-chat-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.new-chat-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
</style>
