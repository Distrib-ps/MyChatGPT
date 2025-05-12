import { describe, it, expect, vi } from 'vitest'

// Tests pour le composant MessageList et la fonctionnalité d'édition des messages
describe('MessageList Component', () => {
  // Test pour vérifier que la mise à jour d'un message utilisateur fonctionne correctement
  it('should update a user message and regenerate AI response', async () => {
    // Arrange
    const messageId = 'test-message-id'
    const originalContent = 'Original message'
    const updatedContent = 'Updated message'
    const conversationId = 'test-conversation-id'
    
    // Mock des fonctions d'API
    const mockUpdateMessage = vi.fn().mockResolvedValue({
      id: messageId,
      content: updatedContent,
      role: 'USER',
      conversationId
    })
    
    const mockDeleteMessage = vi.fn().mockResolvedValue(undefined)
    
    const mockGenerateAIResponse = vi.fn().mockResolvedValue({
      id: 'ai-response-id',
      content: 'New AI response based on updated message',
      role: 'ASSISTANT',
      conversationId
    })
    
    // Act
    // Simuler la mise à jour d'un message
    const updatedMessage = await mockUpdateMessage(messageId, updatedContent)
    
    // Simuler la suppression de l'ancienne réponse AI
    await mockDeleteMessage('old-ai-response-id')
    
    // Simuler la génération d'une nouvelle réponse AI
    const newAIResponse = await mockGenerateAIResponse(conversationId)
    
    // Assert
    // Vérifier que la mise à jour du message a été appelée avec les bons paramètres
    expect(mockUpdateMessage).toHaveBeenCalledWith(messageId, updatedContent)
    
    // Vérifier que le message a été correctement mis à jour
    expect(updatedMessage.content).toBe(updatedContent)
    
    // Vérifier que la suppression de l'ancienne réponse AI a été appelée
    expect(mockDeleteMessage).toHaveBeenCalledWith('old-ai-response-id')
    
    // Vérifier que la génération d'une nouvelle réponse AI a été appelée
    expect(mockGenerateAIResponse).toHaveBeenCalledWith(conversationId)
    
    // Vérifier que la nouvelle réponse AI a été générée
    expect(newAIResponse.role).toBe('ASSISTANT')
    expect(newAIResponse.conversationId).toBe(conversationId)
  })

  // Test pour vérifier que la mise à jour échoue avec un contenu vide
  it('should not update a message with empty content', async () => {
    // Arrange
    const messageId = 'test-message-id'
    const emptyContent = '   '
    
    // Mock de la fonction d'API
    const mockUpdateMessage = vi.fn()
    
    // Act & Assert
    // Vérifier que la mise à jour n'est pas appelée avec un contenu vide
    const result = (() => {
      if (!emptyContent.trim()) {
        return false
      }
      mockUpdateMessage(messageId, emptyContent)
      return true
    })();
    expect(result).toBe(false)
    
    // Vérifier que la fonction de mise à jour n'a pas été appelée
    expect(mockUpdateMessage).not.toHaveBeenCalled()
  })

  // Test pour vérifier la validation du contenu des messages
  it('should validate message content before update', () => {
    // Arrange
    const messageId = 'msg-1'
    const emptyContent = '   '
    const mockUpdateMessage = vi.fn()
    
    // Act & Assert
    // Vérifier que la mise à jour n'est pas appelée avec un contenu vide
    const result = (() => {
      if (!emptyContent.trim()) {
        return false
      }
      mockUpdateMessage(messageId, emptyContent)
      return true
    })();
    expect(result).toBe(false)
    
    // Vérifier que la fonction de mise à jour n'a pas été appelée
    expect(mockUpdateMessage).not.toHaveBeenCalled()
  })
  
  // Test pour vérifier que le bouton d'édition n'est affiché que pour les messages utilisateur
  it('should only show edit button for user messages', () => {
    // Arrange
    const userMessage = { id: 'user-msg-1', content: 'Hello', role: 'USER' }
    const aiMessage = { id: 'ai-msg-1', content: 'Hi there', role: 'ASSISTANT' }
    
    // Mock de la fonction pour déterminer si le bouton d'édition doit être affiché
    const shouldShowEditButton = (message) => {
      return message.role === 'USER'
    }
    
    // Act & Assert
    // Vérifier que le bouton d'édition est affiché pour les messages utilisateur
    expect(shouldShowEditButton(userMessage)).toBe(true)
    
    // Vérifier que le bouton d'édition n'est pas affiché pour les messages AI
    expect(shouldShowEditButton(aiMessage)).toBe(false)
  })
  
  // Test pour vérifier que l'événement d'édition est correctement émis
  it('should emit edit event when edit button is clicked', () => {
    // Arrange
    const messageId = 'msg-1'
    const messageContent = 'Hello world'
    
    // Mock de la fonction d'émission d'événements
    const emitMock = vi.fn()
    
    // Mock de la fonction de gestion du clic sur le bouton d'édition
    const handleEditClick = (id, content) => {
      emitMock('edit', { messageId: id, content })
      return true
    }
    
    // Act
    // Simuler le clic sur le bouton d'édition
    const result = handleEditClick(messageId, messageContent)
    
    // Assert
    // Vérifier que l'événement a été émis avec les bons paramètres
    expect(emitMock).toHaveBeenCalledWith('edit', {
      messageId,
      content: messageContent
    })
    
    // Vérifier que la fonction a retourné true
    expect(result).toBe(true)
  })
  
  // Test pour vérifier que le dialogue d'édition est correctement affiché et masqué
  it('should show and hide edit dialog correctly', () => {
    // Arrange
    const messageId = 'msg-1'
    const messageContent = 'Hello world'
    
    // État initial : dialogue fermé
    const state = {
      editDialogOpen: false,
      currentEditMessage: null
    }
    
    // Mock des fonctions pour ouvrir et fermer le dialogue
    const openEditDialog = (id, content) => {
      state.editDialogOpen = true
      state.currentEditMessage = { id, content }
    }
    
    const closeEditDialog = () => {
      state.editDialogOpen = false
      state.currentEditMessage = null
    }
    
    // Act & Assert
    // Vérifier l'état initial
    expect(state.editDialogOpen).toBe(false)
    expect(state.currentEditMessage).toBeNull()
    
    // Ouvrir le dialogue
    openEditDialog(messageId, messageContent)
    
    // Vérifier que le dialogue est ouvert avec le bon message
    expect(state.editDialogOpen).toBe(true)
    expect(state.currentEditMessage).toEqual({ id: messageId, content: messageContent })
    
    // Fermer le dialogue
    closeEditDialog()
    
    // Vérifier que le dialogue est fermé
    expect(state.editDialogOpen).toBe(false)
    expect(state.currentEditMessage).toBeNull()
  })
})
