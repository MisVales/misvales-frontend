import { expect, Page, test } from '@playwright/test';

const approvedViewports = [
  { name: 'administrative-1440x900', width: 1440, height: 900 },
  { name: 'administrative-minimum-1280x720', width: 1280, height: 720 },
  { name: 'tablet-landscape-1024x768', width: 1024, height: 768 },
  { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-minimum-360x800', width: 360, height: 800 },
] as const;

for (const viewport of approvedViewports) {
  test(`keeps public access usable without horizontal overflow at ${viewport.name}`, async ({
    page,
  }) => {
    const errors = captureUnexpectedClientErrors(page);
    await page.setViewportSize(viewport);
    await page.goto('/acceso');

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByLabel('Experiencia')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('supports keyboard navigation through the public login controls', async ({ page }) => {
  const errors = captureUnexpectedClientErrors(page);
  await page.goto('/acceso');

  await page.getByLabel('Correo electrónico').fill('persona@example.test');
  await page.getByLabel('Contraseña').fill('clave-sintetica');
  await page.getByLabel('Experiencia').selectOption('administrativa');
  await page.getByLabel('Correo electrónico').focus();
  await expect(page.getByLabel('Correo electrónico')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Contraseña')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Experiencia')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeFocused();
  expect(errors).toEqual([]);
});

test('does not expose a client-final application route', async ({ page }) => {
  const errors = captureUnexpectedClientErrors(page);
  await page.goto('/cliente-final');

  await expect(page.getByRole('heading', { name: 'Ruta no encontrada' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('loads a public deep route through the Angular router', async ({ page }) => {
  const errors = captureUnexpectedClientErrors(page);
  await page.goto('/acceso/recuperar');

  await expect(page.getByRole('heading', { name: 'Recuperar contraseña' })).toBeVisible();
  expect(errors).toEqual([]);
});

function captureUnexpectedClientErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console:${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page:${error.message}`));
  page.on('requestfailed', (request) =>
    errors.push(
      `request:${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`,
    ),
  );
  return errors;
}
