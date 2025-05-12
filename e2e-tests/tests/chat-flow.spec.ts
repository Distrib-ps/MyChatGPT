import { test, expect } from '@playwright/test';

test.describe('Chat Application E2E Tests', () => {
  test('should navigate to login page', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    
    // Prendre une capture d'écran pour voir ce qui est réellement chargé
    await page.screenshot({ path: 'homepage.png' });
    
    // Naviguer vers la page de connexion
    await page.goto('/auth/login');
    
    // Prendre une capture d'écran pour voir la page de connexion
    await page.screenshot({ path: 'loginpage.png' });
    
    // Vérifier si un élément de formulaire est visible
    const formCount = await page.locator('form').count();
    console.log('Form count:', formCount);
    
    // Vérifier si les champs du formulaire sont présents
    const emailFieldExists = await page.locator('input[type="email"]').first().isVisible();
    const passwordFieldExists = await page.locator('input[type="password"]').first().isVisible();
    console.log('Email field exists:', emailFieldExists);
    console.log('Password field exists:', passwordFieldExists);
    
    // Si les champs du formulaire sont visibles, essayer de se connecter
    if (emailFieldExists && passwordFieldExists) {
      // Remplir le formulaire de connexion
      await page.fill('input[type="email"]', 'theo@gmail.com');
      await page.fill('input[type="password"]', 'theo');
      
      // Prendre une capture d'écran après avoir rempli le formulaire
      await page.screenshot({ path: 'form-filled.png' });
      
      // Soumettre le formulaire
      await page.click('button[type="submit"]');
      
      // Attendre un peu pour voir ce qui se passe
      await page.waitForTimeout(5000);
      
      // Prendre une capture d'écran après la soumission
      await page.screenshot({ path: 'after-submit.png' });
    }
  });
});
