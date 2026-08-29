import { describe, expect, it, vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { ComposCatalogComponent } from '../../compos-catalog.component';

vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: {
    loadAnimation: () => ({
      destroy: vi.fn(),
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      play: vi.fn(),
    }),
  },
}));

describe('development component catalog route', () => {
  it('does not restore the former public refactor routes', async () => {
    const route = routes.find((candidate) => candidate.path === 'compos');

    expect(routes.some((candidate) => candidate.path?.startsWith('refactor/'))).toBe(false);
    expect(route?.canActivate).toHaveLength(2);
    expect(route?.canActivateChild).toBeUndefined();
    expect(route?.canMatch).toBeUndefined();
    expect(route).toBeDefined();
    expect(await route?.loadComponent?.()).toBe(ComposCatalogComponent);
  });
});
