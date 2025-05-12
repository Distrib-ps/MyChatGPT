<template>
  <div class="conversation-list">
    <div class="header">
      <h2 class="text-lg font-medium">Conversations</h2>
      <button 
        @click="createNewConversation" 
        class="new-conversation-btn"
        :disabled="loading"
      >
        <span v-if="loading">...</span>
        <span v-else>+</span>
      </button>
    </div>
    
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Rechercher..." 
        class="search-input"
        @input="onSearch"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch" 
        class="clear-search-btn"
      >
        ×
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loader"></div>
    </div>
    
    <div v-else-if="conversations.length === 0 && !searchQuery" class="empty-state">
      <p>Aucune conversation</p>
      <button @click="createNewConversation" class="create-btn">
        Créer une conversation
      </button>
    </div>
    
    <div v-else-if="filteredConversations.length === 0 && searchQuery" class="empty-search-results">
      <p>Aucune conversation trouvée pour "{{ searchQuery }}"</p>
      <button @click="clearSearch" class="clear-search-btn-large">
        Effacer la recherche
      </button>
    </div>
    
    <ul v-else class="conversation-items">
      <li 
        v-for="conversation in filteredConversations" 
        :key="conversation.id"
        :class="{ 'active': currentConversationId === conversation.id }"
        class="conversation-item"
      >
        <div 
          class="conversation-content"
          @click="selectConversation(conversation.id)"
        >
          <div class="conversation-title">{{ conversation.title || 'Nouvelle conversation' }}</div>
          <div class="conversation-date">{{ formatDate(conversation.updatedAt) }}</div>
        </div>
        <button 
          class="delete-btn"
          @click.stop="confirmDelete(conversation)"
          title="Supprimer cette conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
  
  <!-- Boîte de dialogue de confirmation de suppression -->
  <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
    <div class="delete-confirm-dialog">
      <h3>Supprimer la conversation</h3>
      <p>Êtes-vous sûr de vouloir supprimer la conversation "{{ conversationToDelete?.title || 'Nouvelle conversation' }}" ?</p>
      <p class="warning">Cette action est irréversible.</p>
      <div class="delete-confirm-actions">
        <button @click="cancelDelete" class="cancel-btn">Annuler</button>
        <button @click="deleteConversation" class="delete-btn-confirm">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'select', 'search', 'clearSearch', 'delete'])

// État de recherche
const searchQuery = ref('')
const searchDebounceTimeout = ref(null)

// État de suppression
const showDeleteConfirm = ref(false)
const conversationToDelete = ref(null)

// Conversations filtrées en fonction de la recherche
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations
  }
  
  // Si nous sommes en mode recherche, utiliser les conversations fournies par le parent
  // qui sont déjà filtrées par l'API
  return props.conversations
})

const route = useRoute()
const router = useRouter()

const currentConversationId = computed(() => {
  return route.params.id
})

const selectConversation = (id) => {
  emit('select', id)
  router.push(`/chat/${id}`)
}

const createNewConversation = () => {
  emit('create')
}

const onSearch = () => {
  // Annuler le timeout précédent s'il existe
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value)
  }
  
  // Définir un nouveau timeout pour éviter trop d'appels API pendant la frappe
  searchDebounceTimeout.value = setTimeout(() => {
    console.log('Recherche en cours...', searchQuery.value)
    if (searchQuery.value.trim()) {
      emit('search', searchQuery.value.trim())
    } else {
      clearSearch()
    }
  }, 300) // Délai de 300ms
}

const clearSearch = () => {
  console.log('Effacement de la recherche')
  searchQuery.value = ''
  emit('clearSearch')
}

// Fonctions pour la suppression de conversation
const confirmDelete = (conversation) => {
  conversationToDelete.value = conversation
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  conversationToDelete.value = null
}

const deleteConversation = () => {
  if (conversationToDelete.value) {
    const id = conversationToDelete.value.id
    console.log(`ConversationList - Émission de l'événement delete pour la conversation: ${id}`)
    
    // Vérifier si l'ID est valide
    if (!id) {
      console.error('ID de conversation invalide')
      return
    }
    
    // Fonction de suppression appelée
    console.log(`Suppression de la conversation: ${id}`)
    
    // Émettre l'événement delete avec l'ID de la conversation
    console.log('Type de l\'ID avant émission:', typeof id)
    emit('delete', id)
    
    showDeleteConfirm.value = false
    conversationToDelete.value = null
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.conversation-list {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.dark .conversation-list {
  background-color: #0f172a;
  color: #e2e8f0;
  border-right-color: #334155;
}

.header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  transition: border-color 0.3s;
}

.dark .header {
  border-bottom-color: #334155;
}

.new-conversation-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.new-conversation-btn:hover {
  background-color: #2563eb;
}

.new-conversation-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  transition: border-color 0.3s;
}

.dark .loader {
  border-color: #334155;
  border-top-color: #3b82f6;
}

.search-container {
  position: relative;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: border-color 0.3s;
}

.dark .search-container {
  border-bottom-color: #334155;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s, color 0.3s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.dark .search-input {
  background-color: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.dark .search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}

.clear-search-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  transition: color 0.3s, background-color 0.3s;
}

.clear-search-btn:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

.dark .clear-search-btn {
  color: #94a3b8;
}

.dark .clear-search-btn:hover {
  color: #e2e8f0;
  background-color: #334155;
}

.empty-search-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  flex: 1;
}

.dark .empty-search-results {
  color: #94a3b8;
}

.clear-search-btn-large {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-search-btn-large:hover {
  background-color: #d1d5db;
}

.dark .clear-search-btn-large {
  background-color: #334155;
  color: #e2e8f0;
}

.dark .clear-search-btn-large:hover {
  background-color: #475569;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Styles pour le bouton de suppression */
.conversation-content {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: none;
  border: none;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s, background-color 0.3s, color 0.3s;
}

.delete-btn:hover {
  opacity: 1;
  background-color: #f3f4f6;
  color: #ef4444;
}

.dark .delete-btn:hover {
  background-color: #334155;
  color: #f87171;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

/* Styles pour la boîte de dialogue de confirmation */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-confirm-dialog {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
}

.dark .delete-confirm-dialog {
  background-color: #1e293b;
  color: #e2e8f0;
}

.delete-confirm-dialog h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1f2937;
}

.dark .delete-confirm-dialog h3 {
  color: #f3f4f6;
}

.delete-confirm-dialog p {
  margin-bottom: 1rem;
  color: #4b5563;
}

.dark .delete-confirm-dialog p {
  color: #d1d5db;
}

.delete-confirm-dialog .warning {
  color: #ef4444;
  font-weight: 500;
}

.dark .delete-confirm-dialog .warning {
  color: #f87171;
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.delete-confirm-actions .cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-confirm-actions .cancel-btn:hover {
  background-color: #e5e7eb;
}

.dark .delete-confirm-actions .cancel-btn {
  background-color: #334155;
  color: #e2e8f0;
}

.dark .delete-confirm-actions .cancel-btn:hover {
  background-color: #475569;
}

.delete-confirm-actions .delete-btn-confirm {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-confirm-actions .delete-btn-confirm:hover {
  background-color: #dc2626;
}

.dark .delete-confirm-actions .delete-btn-confirm {
  background-color: #b91c1c;
}

.dark .delete-confirm-actions .delete-btn-confirm:hover {
  background-color: #991b1b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  flex: 1;
  transition: color 0.3s;
}

.dark .empty-state {
  color: #94a3b8;
}

.create-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
}

.create-btn:hover {
  background-color: #2563eb;
}

.conversation-items {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.conversation-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .conversation-item {
  border-bottom-color: #1e293b;
}

.conversation-item:hover {
  background-color: #f9fafb;
}

.dark .conversation-item:hover {
  background-color: #1e293b;
}

.conversation-item.active {
  background-color: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.dark .conversation-item.active {
  background-color: #172554;
  border-left: 3px solid #3b82f6;
}

.conversation-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-date {
  font-size: 0.75rem;
  color: #6b7280;
  transition: color 0.3s;
}

.dark .conversation-date {
  color: #94a3b8;
}
</style>
