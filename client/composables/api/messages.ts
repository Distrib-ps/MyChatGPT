import type { Message } from '~/types/message'
import { useApi } from '~/composables/useApi'

export const useMessagesApi = () => {
  // Utiliser le composable API centralisé
  const api = useApi()

  const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error)
      throw error
    }
  }

  const sendUserMessage = async (conversationId: string, content: string): Promise<Message> => {
    try {
      const response = await api.post(`/messages/conversation/${conversationId}/user`, { content })
      return response.data
    } catch (error) {
      console.error(`Error sending user message to conversation ${conversationId}:`, error)
      throw error
    }
  }

  const generateAIResponse = async (conversationId: string): Promise<Message> => {
    try {
      const response = await api.post(`/messages/conversation/${conversationId}/assistant`)
      return response.data
    } catch (error) {
      console.error(`Error generating AI response for conversation ${conversationId}:`, error)
      throw error
    }
  }

  const updateMessage = async (id: string, content: string): Promise<Message> => {
    try {
      const response = await api.put(`/messages/${id}`, { content })
      return response.data
    } catch (error) {
      console.error(`Error updating message ${id}:`, error)
      throw error
    }
  }

  const deleteMessage = async (id: string): Promise<void> => {
    try {
      await api.delete(`/messages/${id}`)
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error)
      throw error
    }
  }

  return {
    getMessages,
    sendUserMessage,
    generateAIResponse,
    updateMessage,
    deleteMessage
  }
}
