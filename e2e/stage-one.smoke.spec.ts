import { expect, test } from '@playwright/test';

test('loads the public access layout', async ({ page }) => {
  await page.goto('/acceso');

  await expect(page.getByRole('heading', { name: 'MisVales' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await expect(page.getByLabel('Experiencia')).toContainText('Administrativa');
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
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
});

test('shows the same neutral recovery result without enumerating accounts', async ({ page }) => {
  await page.route('**/api/v1/auth/recovery/password', async (route) => {
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/acceso/recuperar');
  await page.getByLabel('Correo electrónico').fill('persona@example.test');
  await page.getByRole('button', { name: 'Enviar instrucciones' }).click();

  await expect(
    page.getByText(
      'Si la información corresponde a una cuenta elegible, recibirás instrucciones de recuperación.',
    ),
  ).toBeVisible();
});
