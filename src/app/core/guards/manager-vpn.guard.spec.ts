import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../session/session.store';
import { managerVpnGuard } from './manager-vpn.guard';

describe('managerVpnGuard', () => {
  const evaluate = (roles: string[], managerActions: boolean) => {
    const denied = { denied: true };
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionStore, useValue: { roles: () => roles, managerActions: () => managerActions } },
        { provide: Router, useValue: { createUrlTree: vi.fn(() => denied) } },
      ],
    });

    return TestBed.runInInjectionContext(() => managerVpnGuard({} as never, {} as never));
  };

  it('permite acciones gerenciales dentro de la VPN', () => {
    expect(evaluate(['general_manager'], true)).toBe(true);
  });

  it('bloquea una ruta de escritura gerencial fuera de la VPN', () => {
    expect(evaluate(['branch_manager'], false)).toEqual({ denied: true });
  });

  it('no altera los flujos de otros roles', () => {
    expect(evaluate(['coordinator'], false)).toBe(true);
  });
});
