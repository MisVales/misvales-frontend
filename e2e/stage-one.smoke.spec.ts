import { expect, test } from '@playwright/test';

test('loads the public access layout', async ({ page }) => {
  await page.goto('/acceso');

  await expect(page.getByRole('heading', { name: 'MisVales' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acceso', exact: true })).toBeVisible();
});

test('redirects a protected route and preserves an internal return URL', async ({ page }) => {
  await page.goto('/administrativa');

  await expect(page).toHaveURL(/\/acceso\?returnUrl=%2Fadministrativa$/);
});

test('renders controlled permission, routing, offline and technical states', async ({ page }) => {
  const cases = [
    ['/403', 'Acceso denegado'],
    ['/ruta-inexistente', 'Ruta no encontrada'],
    ['/sin-conexion', 'Sin conexión'],
    ['/error', 'Ocurrió un error técnico'],
  ] as const;

  for (const [path, heading] of cases) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('keeps the access experience usable on the approved mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/acceso');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acceso', exact: true })).toBeVisible();
});
