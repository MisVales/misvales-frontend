import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { anyPermissionGuard, permissionGuard } from './permission.guard';
import { roleGuard } from './role.guard';
import { roleWriteGuard } from './role-write.guard';
import { vi } from 'vitest';

describe('permissionGuard', () => {
  let routerSpy: any;
  let sessionStoreSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    sessionStoreSpy = { permissions: vi.fn(), roles: vi.fn() };

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

  it('should return a UrlTree to login if permission is missing', () => {
    sessionStoreSpy.permissions.mockReturnValue(['view_dashboard']);
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);
    const guard = permissionGuard('manage_users');
    
    const result = TestBed.runInInjectionContext(() => {
      return guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('redirects any-permission, role and write denials to login', () => {
    sessionStoreSpy.permissions.mockReturnValue([]);
    sessionStoreSpy.roles.mockReturnValue([]);
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

    const results = TestBed.runInInjectionContext(() => [
      anyPermissionGuard(['manage_users'])(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
      roleGuard(['general_manager'])(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
      roleWriteGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ]);

    expect(results).toEqual([mockUrlTree, mockUrlTree, mockUrlTree]);
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(3);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
