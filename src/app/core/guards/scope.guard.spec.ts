import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { scopeGuard } from './scope.guard';
import { vi } from 'vitest';

describe('scopeGuard', () => {
  let routerSpy: any;
  let sessionStoreSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    sessionStoreSpy = { activeBranch: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy }
      ]
    });
  });

  it('should allow access if active branch is set', () => {
    sessionStoreSpy.activeBranch.mockReturnValue('branch-1');
    
    const result = TestBed.runInInjectionContext(() => {
      return scopeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(true);
  });

  it('should return a UrlTree to the access-denied page if active branch is null', () => {
    sessionStoreSpy.activeBranch.mockReturnValue(null);
    const mockUrlTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);
    
    const result = TestBed.runInInjectionContext(() => {
      return scopeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/acceso-denegado']);
  });
});
