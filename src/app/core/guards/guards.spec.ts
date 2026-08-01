import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { SessionStore } from '@core/session/session.store';

import { anyPermissionGuard } from './any-permission.guard';
import { experienceGuard } from './experience.guard';
import { opaqueIdentifierGuard } from './opaque-identifier.guard';
import { permissionGuard } from './permission.guard';
import { publicOnlyGuard } from './public-only.guard';
import { roleGuard } from './role.guard';
import { rootGuard } from './root.guard';
import { sessionGuard } from './session.guard';

@Component({ template: '' })
class EmptyComponent {}

describe('technical guards', () => {
  let session: SessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: EmptyComponent }])],
    });
    session = TestBed.inject(SessionStore);
  });

  it('redirects a protected route without session and keeps a safe return URL', () => {
    const result = TestBed.runInInjectionContext(() =>
      sessionGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/tableta/visitas' } as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe(
      '/acceso?returnUrl=%2Ftableta%2Fvisitas',
    );
  });

  it('routes an authenticated root to the effective experience', () => {
    session.establish({ experience: 'distribuidora', permissions: new Set() });
    const result = TestBed.runInInjectionContext(() =>
      rootGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/distribuidora');
  });

  it('denies a different experience and grants the effective one', () => {
    session.establish({ experience: 'tableta', permissions: new Set(['visit.view']) });

    const allowed = TestBed.runInInjectionContext(() =>
      experienceGuard(
        { data: { experience: 'tableta' } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as UrlTree;
    const denied = TestBed.runInInjectionContext(() =>
      experienceGuard(
        { data: { experience: 'administrativa' } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(allowed).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(denied)).toBe('/403');
  });

  it('denies permissions by default and redirects public users with a session', () => {
    session.establish({ experience: 'administrativa', permissions: new Set(['report.view']) });

    const granted = TestBed.runInInjectionContext(() =>
      permissionGuard(
        { data: { permission: 'report.view' } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    const denied = TestBed.runInInjectionContext(() =>
      permissionGuard({ data: {} } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;
    const publicResult = TestBed.runInInjectionContext(() =>
      publicOnlyGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(granted).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(denied)).toBe('/403');
    expect(TestBed.inject(Router).serializeUrl(publicResult)).toBe('/administrativa');
  });

  it('grants only an explicitly allowed effective role', () => {
    session.establish({
      experience: 'administrativa',
      permissions: new Set(),
      role: 'ADMINISTRATOR',
    });

    const granted = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: { roles: ['ADMINISTRATOR'] } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    const denied = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: { roles: ['GENERAL_MANAGER'] } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(granted).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(denied)).toBe('/403');
  });

  it('grants a route when any documented capability is present', () => {
    session.establish({
      experience: 'administrativa',
      permissions: new Set(['risk.view.global']),
    });

    const granted = TestBed.runInInjectionContext(() =>
      anyPermissionGuard(
        {
          data: { permissions: ['risk.view.branch', 'risk.view.global'] },
        } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    const denied = TestBed.runInInjectionContext(() =>
      anyPermissionGuard(
        { data: { permissions: [] } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(granted).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(denied)).toBe('/403');
  });

  it('rejects a missing opaque route identifier', () => {
    const result = TestBed.runInInjectionContext(() =>
      opaqueIdentifierGuard(
        {
          data: { identifierParameter: 'resourceId' },
          paramMap: { get: () => '   ' },
        } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/404');
  });
});
