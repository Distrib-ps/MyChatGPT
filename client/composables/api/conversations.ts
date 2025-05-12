import type { Conversation } from '~/types/conversation'
import { useApi } from '~/composables/useApi'

export const useConversationsApi = () => {
  // Utiliser le composable API centralisé
  const api = useApi()

  const getConversations = async (): Promise<Conversation[]> => {
    try {
      const response = await api.get('/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  const getConversation = async (id: string): Promise<Conversation> => {
    try {
      const response = await api.get(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error)
      throw error
    }
  }

  const createConversation = async (title: string = 'Nouvelle conversation'): Promise<Conversation> => {
    try {
      const response = await api.post('/conversations', { title })
      return response.data
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  const updateConversation = async (id: string, title: string): Promise<Conversation> => {
    try {
      const response = await api.put(`/conversations/${id}`, { title })
      return response.data
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error)
      throw error
    }
  }

  const deleteConversation = async (id: string): Promise<void> => {
    try {
      await api.delete(`/conversations/${id}`)
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error)
      throw error
    }
  }

  const searchConversations = async (keyword: string): Promise<Conversation[]> => {
    try {
      console.log('API - Recherche de conversations avec le mot-clé:', keyword)
      const response = await api.get(`/conversations/search?keyword=${encodeURIComponent(keyword.trim())}`)
      console.log('API - Résultats de recherche reçus:', response.data.length)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la recherche de conversations:', error)
      throw error
    }
  }

  return {
    getConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    searchConversations
  }
}
