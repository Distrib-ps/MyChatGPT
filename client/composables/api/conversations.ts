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
    console.log(`API - Début de la suppression de la conversation ${id}`)
    try {
      // Vérifier si le token est présent
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Aucun token d\'authentification trouvé pour la suppression')
        throw new Error('Aucun token d\'authentification trouvé')
      }
      
      // Utiliser directement fetch pour la requête DELETE
      const baseURL = api.defaults.baseURL || 'http://localhost:3000'
      const url = `${baseURL}/conversations/${id}`
      console.log(`API - Envoi de la requête DELETE à ${url}`)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error(`API - Erreur HTTP: ${response.status}`, errorData)
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }
      
      console.log(`API - Conversation ${id} supprimée avec succès`)
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
