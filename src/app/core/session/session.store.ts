import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface SessionScope {
  role: string;
  roleName: string;
  branchId: string | null;
  branchName?: string | null;
  branchCode?: string | null;
  permissions: string[];
}

export interface SessionState {
  user: UserInfo | null;
  roles: string[];
  permissions: string[];
  scopes: SessionScope[];
  activeBranch: string | null;
  isAuthenticated: boolean;
  vpn: boolean;
  managerActions: boolean;
}

const initialState: SessionState = {
  user: null,
  roles: [],
  permissions: [],
  scopes: [],
  activeBranch: null,
  isAuthenticated: false,
  vpn: false,
  managerActions: false,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSession(
      user: UserInfo,
      roles: string[],
      permissions: string[],
      activeBranch: string | null,
      scopes: SessionScope[] = [],
      vpn = false,
      managerActions = false,
    ) {
      patchState(store, {
        user,
        roles,
        permissions,
        scopes,
        activeBranch,
        isAuthenticated: true,
        vpn,
        managerActions,
      });
    },
    clearSession() {
      patchState(store, initialState);
    },
    setActiveBranch(branchId: string) {
      patchState(store, { activeBranch: branchId });
    },
    setManagerAccess(vpn: boolean, managerActions: boolean) {
      patchState(store, { vpn, managerActions });
    },
  })),
);
