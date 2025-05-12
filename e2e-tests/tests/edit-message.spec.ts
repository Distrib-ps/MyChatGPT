import { test, expect } from '@playwright/test';

test.describe('Message Editing Functionality E2E Tests', () => {
  test('should login, send message and edit it', async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/auth/login');
    
    // Remplir le formulaire de connexion
    await page.fill('input[type="email"]', 'theo@gmail.com');
    await page.fill('input[type="password"]', 'theo');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre que la redirection vers la page d'accueil soit terminée
    await page.waitForURL('/chat');
    
    // Créer une nouvelle conversation en cliquant sur le bouton approprié
    await page.click('button:has-text("Nouvelle conversation"), button.new-chat-button');
    
    // Attendre que la nouvelle conversation soit créée et que nous soyons redirigés vers la page de chat
    await page.waitForURL(/\/chat\/.*/);
    
    // Écrire un message initial
    const initialMessage = 'Message initial à éditer';
    await page.fill('textarea.message-input', initialMessage);
    
    // Envoyer le message
    await page.click('button:has-text("Envoyer")');
    
    // Attendre que le message apparaisse dans la liste des messages
    await expect(page.locator(`.message-content:has-text("${initialMessage}")`)).toBeVisible();
    
    // Attendre la réponse de l'IA
    await page.waitForSelector('.message[data-role="ASSISTANT"]', { timeout: 30000 });
    
    // Cliquer sur le bouton d'édition du message utilisateur
    await page.locator('.message[data-role="USER"] .edit-button, .user-message .edit-button').first().click();
    
    // Attendre que le dialogue d'édition s'ouvre
    await expect(page.locator('.edit-dialog, .message-edit-modal, .edit-message-dialog')).toBeVisible();
    
    // Modifier le message
    const editedMessage = 'Message modifié après édition';
    await page.locator('.edit-dialog textarea, .message-edit-modal textarea, .edit-message-dialog textarea').fill(editedMessage);
    
    // Sauvegarder les modifications
    await page.locator('button:has-text("Sauvegarder"), button:has-text("Enregistrer"), button.save-button').click();
    
    // Attendre que le message édité apparaisse dans la liste des messages
    await expect(page.locator(`.message-content:has-text("${editedMessage}")`)).toBeVisible();
    
    // Vérifier que l'ancien message n'est plus visible
    await expect(page.locator(`.message-content:has-text("${initialMessage}")`)).not.toBeVisible();
    
    // Attendre la nouvelle réponse de l'IA
    await page.waitForSelector('.message[data-role="ASSISTANT"]:nth-of-type(2)', { timeout: 30000 });
    
    // Vérifier que nous avons reçu une nouvelle réponse de l'IA
    const assistantMessages = await page.locator('.message[data-role="ASSISTANT"]').count();
    expect(assistantMessages).toBeGreaterThan(1);
  });
});
