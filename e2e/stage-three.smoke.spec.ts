import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

test('Stage 3 - Configuraciones y catalogos', async ({ page }) => {
  // 1. Acceso y Auth
  await page.goto('/acceso');
  await page.fill('input[type="email"]', 'garciaazamardaniel@gmail.com');
  await page.fill('input[type="password"]', 'password123');
  await page.selectOption('select[name="application"]', 'administrativa');
  await page.click('button[type="submit"]');

  // MFA
  await page.waitForSelector('text=Confirma tu identidad');
  const token = authenticator.generate('JBSWY3DPEHPK3PXP');
  await page.fill('input[id="mfa-code"]', token);
  await page.click('button[type="submit"]');

  // Verificamos entrar a administrativa
  await page.waitForURL('**/administrativa');

  // 2. Navegar a Categorías
  await page.click('text=Categorías');
  await page.waitForURL('**/administrativa/categorias');
  
  // 3. Crear Nueva Categoría
  await page.click('text=Nueva Categoría');
  await page.waitForSelector('text=Nueva Categoría');
  await page.fill('input[name="name"]', 'Test Category Playwright');
  await page.fill('textarea[name="description"]', 'Description from E2E');
  await page.fill('input[name="distributorProfitRate"]', '10.5');
  await page.click('button[type="submit"]');

  // Aseguramos que se cierra el modal
  await expect(page.locator('text=Nueva Categoría').first()).not.toBeVisible();

  // 4. Ver Historial
  await page.click('text=Ver Historial de Versiones >> nth=0');
  await page.waitForURL('**/versiones');

  // 5. Publicar versión
  // Buscamos el boton de publicar
  const publishButton = page.locator('button:has-text("Publicar")').first();
  if (await publishButton.isVisible()) {
    await publishButton.click();
  }
});
