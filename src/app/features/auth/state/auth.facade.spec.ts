import { TestBed } from '@angular/core/testing';
import { AuthFacade } from './auth.facade';
import { AuthService } from '../data-access/auth.service';
import { SessionStore } from '@core/session/session.store';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('AuthFacade', () => {
  let facade: any;
  let authServiceSpy: any;
  let sessionStoreSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    authServiceSpy = { login: vi.fn(), verifyMfa: vi.fn(), recoverAccess: vi.fn() };
    sessionStoreSpy = { setSession: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    facade = TestBed.inject(AuthFacade);
  });

  it('should initialize with default state', () => {
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.requiresMfa()).toBe(false);
  });

  it('should handle successful login without MFA', async () => {
    const mockUser = { id: 1, name: 'User', email: 'test@test.com', roles: [], permissions: [] };
    authServiceSpy.login.mockReturnValue(of({ user: mockUser, token: 'token123' }));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(sessionStoreSpy.setSession).toHaveBeenCalledWith(
      { id: 1, name: 'User', email: 'test@test.com' }, [], [], null
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(facade.isLoading()).toBe(false);
    expect(facade.requiresMfa()).toBe(false);
  });

  it('should handle login requiring MFA', async () => {
    authServiceSpy.login.mockReturnValue(of({ requiresMfa: true }));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(facade.requiresMfa()).toBe(true);
    expect(facade.isLoading()).toBe(false);
    expect(sessionStoreSpy.setSession).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ error: { message: 'Bad credentials' } })));

    await facade.login({ email: 'test@test.com', password: 'password' });

    expect(facade.error()).toBe('Bad credentials');
    expect(facade.isLoading()).toBe(false);
  });
});
