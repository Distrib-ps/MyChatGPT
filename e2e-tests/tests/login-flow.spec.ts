import { test, expect } from '@playwright/test';

test.describe('Login and Navigation Flow', () => {
  test('should login and navigate to chat page', async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/auth/login');
    
    // Prendre une capture d'écran pour voir la page de connexion
    await page.screenshot({ path: 'login-page.png' });
    
    // Vérifier si les champs du formulaire sont présents
    const emailField = page.locator('input[type="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    
    // Vérifier que les champs sont visibles
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    
    // Remplir le formulaire de connexion
    await emailField.fill('theo@gmail.com');
    await passwordField.fill('theo');
    
    // Prendre une capture d'écran après avoir rempli le formulaire
    await page.screenshot({ path: 'form-filled.png' });
    
    // Soumettre le formulaire
    await page.locator('button[type="submit"]').click();
    
    // Attendre un peu pour la redirection
    await page.waitForTimeout(3000);
    
    // Prendre une capture d'écran après la connexion
    await page.screenshot({ path: 'after-login.png' });
    
    // Vérifier si nous sommes sur la page de chat
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Vérifier si nous sommes connectés en cherchant des éléments qui n'apparaissent que pour les utilisateurs connectés
    const headerExists = await page.locator('header').isVisible();
    console.log('Header exists:', headerExists);
    
    // Si nous sommes sur la page de chat, essayer de créer une nouvelle conversation
    if (currentUrl.includes('/chat')) {
      // Chercher le bouton pour créer une nouvelle conversation
      const newChatButton = page.locator('button:has-text("Nouvelle conversation"), button.new-chat-button');
      const buttonExists = await newChatButton.isVisible();
      console.log('New chat button exists:', buttonExists);
      
      if (buttonExists) {
        // Cliquer sur le bouton pour créer une nouvelle conversation
        await newChatButton.click();
        
        // Attendre un peu pour la navigation
        await page.waitForTimeout(3000);
        
        // Prendre une capture d'écran après avoir créé une nouvelle conversation
        await page.screenshot({ path: 'new-conversation.png' });
        
        // Vérifier l'URL actuelle
        console.log('URL after creating new conversation:', page.url());
        
        // Attendre que la page de conversation soit chargée
        await page.waitForTimeout(2000);
        
        // Cliquer sur la conversation dans la liste des conversations
        const conversationItem = page.locator('li.conversation-item').first();
        const conversationExists = await conversationItem.isVisible();
        console.log('Conversation item exists:', conversationExists);
        
        if (conversationExists) {
          // Cliquer sur la conversation
          await conversationItem.click();
          
          // Attendre que la conversation soit chargée
          await page.waitForTimeout(2000);
          
          // Prendre une capture d'écran après avoir cliqué sur la conversation
          await page.screenshot({ path: 'conversation-clicked.png' });
        }
        
        // Chercher le champ de saisie du message
        const messageInput = page.locator('textarea.message-input, textarea[placeholder*="message"], textarea');
        const inputExists = await messageInput.isVisible();
        console.log('Message input exists:', inputExists);
        
        if (inputExists) {
          // Écrire un message
          const messageText = 'Bonjour, peux-tu me dire qui est le président de la France en 2025 ?';
          await messageInput.fill(messageText);
          
          // Prendre une capture d'écran après avoir écrit le message
          await page.screenshot({ path: 'message-written.png' });
          
          // Chercher le bouton d'envoi
          const sendButton = page.locator('button:has-text("Envoyer"), button[type="submit"], button.send-button');
          const sendButtonExists = await sendButton.isVisible();
          console.log('Send button exists:', sendButtonExists);
          
          if (sendButtonExists) {
            // Envoyer le message
            await sendButton.click();
            
            // Attendre que le message soit envoyé et que l'IA commence à répondre
            await page.waitForTimeout(5000);
            
            // Prendre une capture d'écran après avoir envoyé le message
            await page.screenshot({ path: 'message-sent.png' });
            
            // Vérifier si notre message est affiché
            // Utiliser un sélecteur plus précis pour trouver le message de l'utilisateur
            const userMessageExists = await page.locator('.message[data-role="USER"], .user-message, .message-user').first().isVisible();
            console.log('User message is displayed:', userMessageExists);
            
            // Vérifier si le contenu du message est correct (sans utiliser :has-text)
            if (userMessageExists) {
              const messageContent = await page.locator('.message[data-role="USER"], .user-message, .message-user').first().textContent();
              console.log('Message content:', messageContent);
            }
            
            // Attendre la réponse de l'IA (avec un timeout plus long)
            await page.waitForTimeout(10000);
            
            // Prendre une capture d'écran après la réponse de l'IA
            await page.screenshot({ path: 'ai-response.png' });
            
            // Vérifier si une réponse de l'IA est affichée
            const aiResponseExists = await page.locator('.message[data-role="ASSISTANT"], .assistant-message, .ai-message').isVisible();
            console.log('AI response is displayed:', aiResponseExists);
          }
        }
      }
    }
  });
});
