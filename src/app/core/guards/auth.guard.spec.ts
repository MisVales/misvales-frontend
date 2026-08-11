import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { authGuard } from './auth.guard';
import { vi } from 'vitest';
import { MeService } from '../services/me.service';
import { throwError } from 'rxjs';

describe('authGuard', () => {
  let routerSpy: any;
  let sessionStoreSpy: any;
  let meServiceSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    sessionStoreSpy = { isAuthenticated: vi.fn() };
    meServiceSpy = { fetchMe: vi.fn(() => throwError(() => new Error('unauthenticated'))) };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: MeService, useValue: meServiceSpy }
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
});
