import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { RiesgoApiService } from '../../../delinquency/riesgo-api.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent delinquency scope', () => {
  const riskApi = { me: vi.fn(() => of({ blocked: false, reason: null })) };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: RiesgoApiService, useValue: riskApi }],
    });
  });

  it('does not request distributor delinquency for a non-distributor account', () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'manager', name: 'Gerencia', email: 'manager@example.test' },
      ['general_manager'],
      ['all'],
      null,
    );

    const component = TestBed.createComponent(ProfileComponent).componentInstance;

    expect(component.isDistributor).toBe(false);
    expect(riskApi.me).not.toHaveBeenCalled();
  });

  it('requests the status for a distributor account', () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'distributor', name: 'Pepe', email: 'pepe@example.test' },
      ['distributor'],
      ['risk.view_own'],
      null,
    );

    const component = TestBed.createComponent(ProfileComponent).componentInstance;

    expect(component.isDistributor).toBe(true);
    expect(riskApi.me).toHaveBeenCalledOnce();
  });
});
