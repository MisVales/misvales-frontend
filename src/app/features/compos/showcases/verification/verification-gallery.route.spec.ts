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
  it('contains the verifier gallery inside the isolated catalog', async () => {
    const route = routes.find((candidate) => candidate.path === 'compos');

    expect(route).toBeDefined();
    expect(route?.canActivate).toHaveLength(2);
    expect(route?.canMatch).toBeUndefined();
    expect(route?.children).toBeUndefined();
    expect(await route?.loadComponent?.()).toBe(ComposCatalogComponent);
  });
});
