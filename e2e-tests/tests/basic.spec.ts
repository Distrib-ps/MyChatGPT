import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the application', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    
    // Vérifier que la page s'est chargée
    await expect(page).toHaveURL(/.*\/*/);
    
    // Vérifier qu'un élément de base est visible
    await expect(page.locator('body')).toBeVisible();
    
    // Prendre une capture d'écran pour voir ce qui est réellement chargé
    await page.screenshot({ path: 'homepage.png' });
  });
});
