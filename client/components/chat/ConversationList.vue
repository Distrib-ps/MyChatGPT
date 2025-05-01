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
    
    <div v-if="loading" class="loading">
      <div class="loader"></div>
    </div>
    
    <div v-else-if="conversations.length === 0" class="empty-state">
      <p>Aucune conversation</p>
      <button @click="createNewConversation" class="create-btn">
        Créer une conversation
      </button>
    </div>
    
    <ul v-else class="conversation-items">
      <li 
        v-for="conversation in conversations" 
        :key="conversation.id"
        :class="{ 'active': currentConversationId === conversation.id }"
        @click="selectConversation(conversation.id)"
        class="conversation-item"
      >
        <div class="conversation-title">{{ conversation.title || 'Nouvelle conversation' }}</div>
        <div class="conversation-date">{{ formatDate(conversation.updatedAt) }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const emit = defineEmits(['create', 'select'])

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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
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
