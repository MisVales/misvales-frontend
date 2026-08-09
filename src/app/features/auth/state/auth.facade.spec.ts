import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthTokenStore } from '@core/session/auth-token.store';
import { SessionStore } from '@core/session/session.store';
import { MeService } from '@core/services/me.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../data-access/auth.service';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  const authService = {
    login: vi.fn(),
    logout: vi.fn(),
  };
  const router = { navigate: vi.fn().mockResolvedValue(true) };
  const meService = { fetchMe: vi.fn().mockReturnValue(of({})) };
  const sessionStore = { clearSession: vi.fn() };
  const tokenStore = { clear: vi.fn() };
  const alerts = { showAlert: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: MeService, useValue: meService },
        { provide: SessionStore, useValue: sessionStore },
        { provide: AuthTokenStore, useValue: tokenStore },
        { provide: AlertService, useValue: alerts },
      ],
    });
  });

  it('inicia con estado seguro y sin desafío MFA', () => {
    const facade = TestBed.inject(AuthFacade);
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.mfaChallengeToken()).toBeNull();
  });

  it('carga /me y navega al inicio después del login completo', async () => {
    authService.login.mockReturnValue(of({ access_token: 'access' }));
    const facade = TestBed.inject(AuthFacade);

    await facade.login({ email: 'test@example.com', password: 'password' });

    expect(meService.fetchMe).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    expect(facade.isLoading()).toBe(false);
  });

  it('conserva el desafío en memoria y navega al segundo factor', async () => {
    authService.login.mockReturnValue(of({
      mfa_challenge_token: 'challenge',
      available_mfa: ['TOTP'],
      expires_in: 300,
    }));
    const facade = TestBed.inject(AuthFacade);

    await facade.login({ email: 'test@example.com', password: 'password' });

    expect(facade.mfaChallengeToken()).toBe('challenge');
    expect(facade.availableMfa()).toEqual(['TOTP']);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/totp']);
  });

  it('traduce el código estable de credenciales inválidas', async () => {
    authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 422,
      error: { code: 'INVALID_CREDENTIALS' },
    })));
    const facade = TestBed.inject(AuthFacade);

    await facade.login({ email: 'test@example.com', password: 'bad' });

    expect(facade.error()).toBe('El correo o contraseña son incorrectos.');
    expect(facade.isLoading()).toBe(false);
  });
});
