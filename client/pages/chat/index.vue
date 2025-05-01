<template>
  <div class="chat-page">
    <div class="sidebar">
      <ConversationList 
        :conversations="conversations" 
        :loading="loadingConversations"
        @create="createConversation"
        @select="selectConversation"
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

// Composable pour les conversations (à implémenter)
const useConversations = () => {
  const conversations = ref([])
  const loadingConversations = ref(true)
  
  const fetchConversations = async () => {
    loadingConversations.value = true
    try {
      // Simuler un appel API (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données de test (à remplacer par les données réelles)
      conversations.value = [
        {
          id: '1',
          title: 'Introduction à l\'IA',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Comment fonctionne GPT-4',
          updatedAt: new Date(Date.now() - 86400000).toISOString(), // Hier
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    } finally {
      loadingConversations.value = false
    }
  }
  
  const createConversation = async () => {
    loadingConversations.value = true
    try {
      // Simuler un appel API (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Créer une nouvelle conversation (à remplacer par un vrai appel API)
      const newConversation = {
        id: Date.now().toString(),
        title: 'Nouvelle conversation',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
      
      conversations.value = [newConversation, ...conversations.value]
      
      return newConversation
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
      return null
    } finally {
      loadingConversations.value = false
    }
  }
  
  return {
    conversations,
    loadingConversations,
    fetchConversations,
    createConversation
  }
}

const router = useRouter()
const { conversations, loadingConversations, fetchConversations, createConversation } = useConversations()

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
