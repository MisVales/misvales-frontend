import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { authGuard } from './auth.guard';
import { vi } from 'vitest';
import { MeService } from '@core/auth/data-access/me.service';
import { throwError } from 'rxjs';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionRefreshService } from '../session/session-refresh.service';

describe('authGuard', () => {
  let routerSpy: any;
  let sessionStoreSpy: any;
  let meServiceSpy: any;
  let tokenStoreSpy: any;
  let sessionRefreshSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    sessionStoreSpy = { isAuthenticated: vi.fn(), clearSession: vi.fn() };
    meServiceSpy = { fetchMe: vi.fn(() => throwError(() => new Error('unauthenticated'))) };
    tokenStoreSpy = { accessToken: vi.fn(() => null), clear: vi.fn() };
    sessionRefreshSpy = { refresh: vi.fn(() => throwError(() => new Error('no session'))) };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: MeService, useValue: meServiceSpy },
        { provide: AuthTokenStore, useValue: tokenStoreSpy },
        { provide: SessionRefreshService, useValue: sessionRefreshSpy }
      ]
    });
  });

  it('should allow access if authenticated', async () => {
    sessionStoreSpy.isAuthenticated.mockReturnValue(true);
    
    const result = await TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
  });

  it('should return a UrlTree to /login if not authenticated', async () => {
    sessionStoreSpy.isAuthenticated.mockReturnValue(false);
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);
    
    const result = await TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('returns to login when /me cannot restore the session', async () => {
    tokenStoreSpy.accessToken.mockReturnValue('token');
    meServiceSpy.fetchMe.mockReturnValue(throwError(() => new Error('unavailable')));
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(tokenStoreSpy.clear).toHaveBeenCalledOnce();
    expect(sessionStoreSpy.clearSession).toHaveBeenCalledOnce();
  });
});
