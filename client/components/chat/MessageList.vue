<template>
  <div class="message-list" ref="messageListRef">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-content">
        <h3 class="text-lg font-medium mb-2">Commencez une nouvelle conversation</h3>
        <p class="text-gray-500 mb-4">Posez une question à l'IA pour démarrer</p>
      </div>
    </div>
    
    <div v-else class="messages-container">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :id="`message-${message.id}`"
        class="message-item" 
        :class="normalizeRole(message.role)"
      >
        <div class="message-avatar">
          <div v-if="normalizeRole(message.role) === 'user'" class="avatar user-avatar">
            <span>U</span>
          </div>
          <div v-else class="avatar assistant-avatar">
            <span>AI</span>
          </div>
        </div>
        <div class="message-content">
          <!-- Mode d'édition pour les messages utilisateur -->
          <div v-if="editingMessageId === message.id" class="edit-message-container">
            <textarea 
              v-model="editedMessageContent" 
              class="edit-message-textarea"
              @keydown.enter.ctrl="updateMessage(message)"
              @keydown.esc="cancelEdit"
              :id="`edit-textarea-${message.id}`"
            ></textarea>
            <div class="edit-actions">
              <button @click="updateMessage(message)" class="save-edit-btn">Enregistrer</button>
              <button @click="cancelEdit" class="cancel-edit-btn">Annuler</button>
              <div class="edit-hint">Ctrl+Enter pour enregistrer</div>
            </div>
          </div>
          
          <!-- Affichage normal du message -->
          <div v-else class="message-text" v-html="formatMessage(message.content)"></div>
          
          <div class="message-footer">
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
            
            <!-- Boutons d'action pour les messages utilisateur -->
            <div v-if="normalizeRole(message.role) === 'user' && !loading" class="message-actions">
              <button 
                @click="startEdit(message)" 
                class="edit-message-btn" 
                title="Modifier et regénérer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="message-item assistant">
        <div class="message-avatar">
          <div class="avatar assistant-avatar">
            <span>AI</span>
          </div>
        </div>
        <div class="message-content">
          <div class="message-text">
            <div class="thinking-container">
              <span class="thinking-text">L'IA réfléchit</span>
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
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

const emit = defineEmits(['update-message'])

// Variables pour l'édition des messages
const editingMessageId = ref(null)
const editedMessageContent = ref('')
const editTextarea = ref(null)

// Initialiser les boutons de copie lors du montage du composant
onMounted(() => {
  addCopyButtons()
})

const messageListRef = ref(null)

// Scroll to bottom when messages change and add copy buttons
watch(() => [...props.messages, props.loading], async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    addCopyButtons()
  }
}, { deep: true })

// Format message with markdown
const formatMessage = (content) => {
  if (!content) return ''
  
  // Convertir le markdown en HTML
  let html = marked.parse(content)
  
  // Nettoyer le HTML
  return DOMPurify.sanitize(html)
}

// Fonction pour ajouter des boutons de copie aux blocs de code après le rendu
const addCopyButtons = () => {
  nextTick(() => {
    // Sélectionner tous les blocs de code
    const codeBlocks = document.querySelectorAll('.message-text pre')
    
    codeBlocks.forEach((codeBlock) => {
      // Vérifier si le bloc de code a déjà un bouton de copie
      if (codeBlock.parentNode.classList.contains('code-block-wrapper')) {
        return
      }
      
      // Créer un div pour contenir le bouton
      const buttonContainer = document.createElement('div')
      buttonContainer.className = 'code-header'
      
      // Créer le bouton de copie
      const copyButton = document.createElement('button')
      copyButton.className = 'copy-button'
      copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
      
      // Ajouter l'événement de clic
      copyButton.addEventListener('click', () => {
        const code = codeBlock.querySelector('code').textContent
        navigator.clipboard.writeText(code).then(() => {
          copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          copyButton.classList.add('copied')
          
          setTimeout(() => {
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
            copyButton.classList.remove('copied')
          }, 2000)
        })
      })
      
      // Ajouter le bouton au container
      buttonContainer.appendChild(copyButton)
      
      // Créer un wrapper pour le bloc de code
      const wrapper = document.createElement('div')
      wrapper.className = 'code-block-wrapper'
      
      // Ajouter le header au wrapper
      wrapper.appendChild(buttonContainer)
      
      // Remplacer le bloc de code par le wrapper
      codeBlock.parentNode.insertBefore(wrapper, codeBlock)
      wrapper.appendChild(codeBlock)
    })
  })
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

// Méthodes pour l'édition des messages
const startEdit = (message) => {
  // Enregistrer l'ID du message en cours d'édition
  editingMessageId.value = message.id
  // Initialiser le contenu du message à éditer
  editedMessageContent.value = message.content
  
  // Focus sur le textarea après le rendu
  nextTick(() => {
    // Utiliser l'ID unique du textarea pour le cibler
    const textareaId = `edit-textarea-${message.id}`
    const textarea = document.getElementById(textareaId)
    if (textarea) {
      textarea.focus()
      // Placer le curseur à la fin du texte
      textarea.selectionStart = textarea.value.length
    }
  })
}

const cancelEdit = () => {
  // Réinitialiser les variables d'édition
  editingMessageId.value = null
  editedMessageContent.value = ''
}

const updateMessage = (message) => {
  // Vérifier que le contenu n'est pas vide
  if (!editedMessageContent.value.trim()) {
    return
  }
  
  // Déboguer le message complet
  console.log('MessageList - message complet:', message)
  
  // Vérifier si conversationId est défini
  if (!message.conversationId) {
    console.error('MessageList - ERREUR: conversationId est manquant dans le message!')
  }
  
  console.log('MessageList - updateMessage:', {
    messageId: message.id,
    content: editedMessageContent.value.trim(),
    conversationId: message.conversationId
  })
  
  // Émettre un événement pour mettre à jour le message et regénérer la réponse
  emit('update-message', {
    messageId: message.id,
    content: editedMessageContent.value.trim(),
    conversationId: message.conversationId || props.messages[0]?.conversationId // Fallback au premier message si disponible
  })
  
  // Réinitialiser le mode d'édition
  cancelEdit()
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
  transition: background-color 0.3s, color 0.3s;
}

.dark .message-content {
  background-color: #1e293b;
  color: #e2e8f0;
}

.message-item.user .message-content {
  background-color: #eff6ff;
}

.dark .message-item.user .message-content {
  background-color: #172554;
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
  transition: color 0.3s;
}

.dark .message-time {
  color: #94a3b8;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.edit-message-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}

.edit-message-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.dark .edit-message-btn {
  color: #9ca3af;
}

.dark .edit-message-btn:hover {
  background-color: #374151;
  color: #f9fafb;
}

.edit-message-container {
  width: 100%;
}

.edit-message-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: inherit;
  resize: vertical;
  background-color: #ffffff;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dark .edit-message-textarea {
  background-color: #1f2937;
  border-color: #4b5563;
  color: #f9fafb;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-edit-btn,
.cancel-edit-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-edit-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.save-edit-btn:hover {
  background-color: #2563eb;
}

.cancel-edit-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.cancel-edit-btn:hover {
  background-color: #e5e7eb;
}

.dark .cancel-edit-btn {
  background-color: #374151;
  color: #e5e7eb;
  border-color: #4b5563;
}

.dark .cancel-edit-btn:hover {
  background-color: #4b5563;
}

.edit-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: auto;
}

.dark .edit-hint {
  color: #9ca3af;
}

/* Thinking container */
.thinking-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.thinking-text {
  font-weight: 500;
  color: #4b5563;
}

.dark .thinking-text {
  color: #e2e8f0;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #6b7280;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.dark .typing-indicator span {
  background-color: #94a3b8;
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

/* Styles pour les blocs de code */
.code-block-wrapper {
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #1e293b;
  border: 1px solid #1e293b;
  position: relative;
}

.code-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  background-color: #1e293b;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.copy-button {
  padding: 0.25rem;
  font-size: 0.75rem;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}



.copy-button:hover {
  background-color: #2563eb;
  color: white;
}

.copy-button.copied {
  background-color: #10b981;
  color: white;
}

.code-block-wrapper pre {
  margin: 0;
  padding: 1rem;
  background-color: transparent;
  overflow-x: auto;
  color: #e2e8f0;
}

.code-block-wrapper code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-bubble {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  max-width: 80%;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
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
  transition: background-color 0.3s, color 0.3s;
}

.dark :deep(code) {
  background-color: #334155;
  color: #e2e8f0;
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
