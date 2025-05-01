<template>
  <div class="message-input-container">
    <form @submit.prevent="sendMessage" class="message-form">
      <textarea
        ref="textareaRef"
        v-model="message"
        placeholder="Écrivez votre message ici..."
        class="message-textarea"
        :disabled="disabled"
        @keydown.enter.prevent="handleEnterKey"
        @input="autoResize"
      ></textarea>
      <button
        type="submit"
        class="send-button"
        :disabled="!message.trim() || disabled"
      >
        <span v-if="disabled">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const message = ref('')
const textareaRef = ref(null)

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})

const sendMessage = () => {
  if (message.value.trim() && !props.disabled) {
    emit('send', message.value)
    message.value = ''
    
    // Reset textarea height
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

const handleEnterKey = (e) => {
  // Send message on Enter, but allow Shift+Enter for new line
  if (!e.shiftKey) {
    sendMessage()
  }
}

const autoResize = () => {
  const textarea = textareaRef.value
  if (textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Set the height to the scrollHeight (content height)
    // with a max height of 150px
    const newHeight = Math.min(textarea.scrollHeight, 150)
    textarea.style.height = `${newHeight}px`
  }
}
</script>

<style scoped>
.message-input-container {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
}

.message-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.message-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 150px;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.message-textarea:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.send-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
</style>
