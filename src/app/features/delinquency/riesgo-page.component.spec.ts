import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../core/session/session.store';
import { RiesgoApiService } from './riesgo-api.service';
import { RiesgoPageComponent } from './riesgo-page.component';

describe('RiesgoPageComponent actor scope', () => {
  const api = {
    me: vi.fn(() => of(null)),
    alerts: vi.fn(() => of([])),
    delinquencyBlocks: vi.fn(() => of([])),
    removals: vi.fn(() => of([])),
    decide: vi.fn(),
    requestRemoval: vi.fn(),
    decideRemoval: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: RiesgoApiService, useValue: api }] });
  });

  it('does not request self delinquency for a general manager with every permission', () => {
    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'manager', name: 'Gerencia', email: 'manager@example.test' },
      ['general_manager'],
      ['risk.view_own', 'risk.view_global', 'delinquency_removal.decide_global'],
      null,
    );

    TestBed.createComponent(RiesgoPageComponent);

    expect(api.me).not.toHaveBeenCalled();
    expect(api.alerts).toHaveBeenCalledOnce();
    expect(api.delinquencyBlocks).toHaveBeenCalledOnce();
    expect(api.removals).toHaveBeenCalledOnce();
  });
});
