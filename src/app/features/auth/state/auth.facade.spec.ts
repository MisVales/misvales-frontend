import { TestBed } from '@angular/core/testing';
import { AuthFacade } from './auth.facade';
import { AuthService } from '../data-access/auth.service';
import { SessionStore } from '@core/session/session.store';
import { MeService } from '@core/services/me.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';

describe('AuthFacade', () => {
  let facade: any;
  let authServiceSpy: any;
  let sessionStoreSpy: any;
  let routerSpy: any;
  let meServiceSpy: any;

  beforeEach(() => {
    authServiceSpy = {
      login: vi.fn(),
      logout: vi.fn()
    };
    sessionStoreSpy = {
      setSession: vi.fn(),
      clearSession: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn()
    };
    meServiceSpy = {
      fetchMe: vi.fn().mockReturnValue(of({}))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MeService, useValue: meServiceSpy },
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    });

    facade = TestBed.inject(AuthFacade);
  });

  it('should initialize with default state', () => {
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBe(null);
    expect(facade.requiresMfa()).toBe(false);
  });

  it('should handle successful login without MFA', async () => {
    authServiceSpy.login.mockReturnValue(of({
      requiresMfa: false,
      token: 'fake-token',
      user: { id: '1', name: 'Administrador Demo', email: 'test@test.com', roles: [], permissions: [] }
    }));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(meServiceSpy.fetchMe).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(facade.isLoading()).toBe(false);
  });

  it('should handle login requiring MFA', async () => {
    authServiceSpy.login.mockReturnValue(of({
      requiresMfa: true,
      token: 'temp-token',
      user: { id: '1', name: 'User', email: 'test@test.com', roles: [], permissions: [] }
    }));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(facade.requiresMfa()).toBe(true);
    expect(facade.isLoading()).toBe(false);
    expect(meServiceSpy.fetchMe).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    authServiceSpy.login.mockReturnValue(throwError(() => new Error('Bad credentials')));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(facade.error()).toBe('Ocurrió un error al intentar iniciar sesión. Por favor, intente de nuevo.');
    expect(facade.isLoading()).toBe(false);
  });
});
