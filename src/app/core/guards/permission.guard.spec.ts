import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { permissionGuard } from './permission.guard';
import { vi } from 'vitest';

describe('permissionGuard', () => {
  let routerSpy: any;
  let sessionStoreSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    sessionStoreSpy = { permissions: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy }
      ]
    });
  });

  it('should allow access if user has the required permission', () => {
    sessionStoreSpy.permissions.mockReturnValue(['view_dashboard', 'manage_users']);
    const guard = permissionGuard('manage_users');
    
    const result = TestBed.runInInjectionContext(() => {
      return guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
  });

  it('should return a UrlTree to / if user lacks the required permission', () => {
    sessionStoreSpy.permissions.mockReturnValue(['view_dashboard']);
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);
    const guard = permissionGuard('manage_users');
    
    const result = TestBed.runInInjectionContext(() => {
      return guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
