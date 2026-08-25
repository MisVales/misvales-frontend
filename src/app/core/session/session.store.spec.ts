import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  let store: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionStore]
    });
    store = TestBed.inject(SessionStore);
  });

  it('should initialize with default state', () => {
    expect(store.user()).toBeNull();
    expect(store.roles()).toEqual([]);
    expect(store.permissions()).toEqual([]);
    expect(store.scopes()).toEqual([]);
    expect(store.activeBranch()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.vpn()).toBe(false);
    expect(store.managerActions()).toBe(false);
  });

  it('should set session correctly', () => {
    const user = { id: 1, name: 'Test', email: 'test@test.com' };
    const roles = ['admin'];
    const permissions = ['manage_users'];
    const activeBranch = 'branch-123';
    const scopes = [
      {
        role: 'admin',
        roleName: 'Administrador',
        branchId: null,
        permissions,
      },
    ];

    store.setSession(user, roles, permissions, activeBranch, scopes, true, true);

    expect(store.user()).toEqual(user);
    expect(store.roles()).toEqual(roles);
    expect(store.permissions()).toEqual(permissions);
    expect(store.scopes()).toEqual(scopes);
    expect(store.activeBranch()).toEqual(activeBranch);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.vpn()).toBe(true);
    expect(store.managerActions()).toBe(true);
  });

  it('should clear session correctly', () => {
    // Primero seteamos
    store.setSession({ id: 1, name: 'Test', email: 'test@test.com' }, [], [], null);
    expect(store.isAuthenticated()).toBe(true);

    // Luego limpiamos
    store.clearSession();

    expect(store.user()).toBeNull();
    expect(store.roles()).toEqual([]);
    expect(store.permissions()).toEqual([]);
    expect(store.activeBranch()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });
});
