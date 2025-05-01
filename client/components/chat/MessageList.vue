<template>
  <div class="message-list" ref="messageListRef">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-content">
        <h3 class="text-lg font-medium mb-2">Commencez une nouvelle conversation</h3>
        <p class="text-gray-500 mb-4">Posez une question à l'IA pour démarrer</p>
      </div>
    </div>
    
    <div v-else class="messages-container">
      <div v-for="(message, index) in messages" :key="index" class="message-item" :class="normalizeRole(message.role)">
        <div class="message-avatar">
          <div v-if="normalizeRole(message.role) === 'user'" class="avatar user-avatar">
            <span>U</span>
          </div>
          <div v-else class="avatar assistant-avatar">
            <span>AI</span>
          </div>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>
          <div class="message-time">{{ formatTime(message.createdAt) }}</div>
        </div>
      </div>
      
      <div v-if="loading" class="message-item assistant">
        <div class="message-avatar">
          <div class="avatar assistant-avatar">
            <span>AI</span>
          </div>
        </div>
        <div class="message-content">
          <div class="message-text typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { MessageRole } from '~/types/message'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const messageListRef = ref(null)

// Scroll to bottom when messages change
watch(() => [...props.messages, props.loading], async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}, { deep: true })

// Format message with markdown
const formatMessage = (content) => {
  // Convertir le markdown en HTML et le nettoyer
  const html = DOMPurify.sanitize(marked.parse(content))
  return html
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const normalizeRole = (role) => {
  if (!role) return 'assistant'
  
  // Convertir en minuscules pour la comparaison
  const normalizedRole = role.toLowerCase()
  
  // Vérifier si c'est un rôle utilisateur
  if (normalizedRole === 'user' || normalizedRole === 'utilisateur') {
    return 'user'
  }
  
  // Par défaut, retourner assistant
  return 'assistant'
}
</script>

<style scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-content {
  max-width: 400px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.user-avatar {
  background-color: #3b82f6;
}

.assistant-avatar {
  background-color: #10b981;
}

.message-content {
  background-color: #f3f4f6;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  position: relative;
}

.message-item.user .message-content {
  background-color: #eff6ff;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: right;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #6b7280;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Style for markdown content */
:deep(pre) {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

:deep(code) {
  font-family: monospace;
  background-color: #e2e8f0;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(ul), :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
}
</style>
