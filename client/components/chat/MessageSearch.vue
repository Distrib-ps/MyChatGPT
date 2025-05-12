<template>
  <div class="message-search">
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Rechercher dans les messages..." 
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
    
    <div v-if="isSearching && !searchResults.length" class="search-results-info">
      <p>Recherche en cours...</p>
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div class="search-results-header">
        <h3>{{ searchResults.length }} résultat(s) trouvé(s)</h3>
        <button @click="clearSearch" class="clear-search-btn-large">
          Effacer la recherche
        </button>
      </div>
      <ul class="search-results-list">
        <li 
          v-for="message in searchResults" 
          :key="message.id"
          class="search-result-item"
          @click="scrollToMessage(message.id)"
        >
          <div class="message-role">{{ message.role === 'USER' ? 'Vous' : 'Assistant' }}</div>
          <div class="message-preview" v-html="highlightKeyword(message.content, searchQuery)"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMessagesApi } from '~/composables/api/messages'

const props = defineProps({
  conversationId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['scrollToMessage'])

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const searchDebounceTimeout = ref(null)
const messagesApi = useMessagesApi()

const onSearch = () => {
  // Annuler le timeout précédent s'il existe
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value)
  }
  
  // Si la requête est vide, effacer les résultats
  if (!searchQuery.value.trim()) {
    clearSearch()
    return
  }
  
  // Définir un nouveau timeout pour éviter trop d'appels API pendant la frappe
  searchDebounceTimeout.value = setTimeout(async () => {
    isSearching.value = true
    
    try {
      // Rechercher les messages contenant le mot-clé
      const results = await messagesApi.searchMessages(
        props.conversationId,
        searchQuery.value.trim()
      )
      
      searchResults.value = results
    } catch (error) {
      console.error('Erreur lors de la recherche de messages:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300) // Délai de 300ms
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
}

const scrollToMessage = (messageId) => {
  emit('scrollToMessage', messageId)
}

const highlightKeyword = (content, keyword) => {
  if (!keyword || !content) return content
  
  // Échapper les caractères spéciaux dans la requête pour éviter les problèmes avec les expressions régulières
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Créer une expression régulière pour trouver toutes les occurrences du mot-clé (insensible à la casse)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  
  // Remplacer toutes les occurrences par la même chaîne entourée de balises de surbrillance
  return content.replace(regex, '<span class="highlight">$1</span>')
}

// Effacer la recherche si la conversation change
watch(() => props.conversationId, () => {
  clearSearch()
})
</script>

<style scoped>
.message-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.search-container {
  position: relative;
  width: 100%;
  margin-bottom: 0.5rem;
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
  right: 0.5rem;
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

.search-results {
  margin-top: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.dark .search-results {
  border-color: #334155;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dark .search-results-header {
  background-color: #1e293b;
  border-bottom-color: #334155;
}

.search-results-header h3 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  color: #4b5563;
}

.dark .search-results-header h3 {
  color: #e2e8f0;
}

.clear-search-btn-large {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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

.search-results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: 250px;
}

.search-result-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f3f4f6;
}

.dark .search-result-item {
  border-bottom-color: #334155;
}

.dark .search-result-item:hover {
  background-color: #1f2937;
}

.message-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.dark .message-role {
  color: #94a3b8;
}

.message-preview {
  font-size: 0.875rem;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.dark .message-preview {
  color: #e2e8f0;
}

.search-results-info {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.dark .search-results-info {
  color: #94a3b8;
}

.highlight {
  background-color: rgba(59, 130, 246, 0.2);
  font-weight: bold;
  border-radius: 2px;
  padding: 0 2px;
}

.dark .highlight {
  background-color: rgba(96, 165, 250, 0.3);
}
</style>
