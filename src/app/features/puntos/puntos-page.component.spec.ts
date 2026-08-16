import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../core/session/session.store';
import { PuntosApiService } from './puntos-api.service';
import { PuntosPageComponent } from './puntos-page.component';

describe('PuntosPageComponent actor scope', () => {
  const api = {
    account: vi.fn(() => of(null)),
    requests: vi.fn(() => of([])),
    request: vi.fn(),
    decide: vi.fn(),
    deliver: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: PuntosApiService, useValue: api }] });
  });

  it('does not request the self account for a general manager with every permission', () => {
    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'manager', name: 'Gerencia', email: 'manager@example.test' },
      ['general_manager'],
      ['points.view_own', 'points.authorize_global'],
      null,
    );

    TestBed.createComponent(PuntosPageComponent);

    expect(api.account).not.toHaveBeenCalled();
    expect(api.requests).toHaveBeenCalledOnce();
  });
});
