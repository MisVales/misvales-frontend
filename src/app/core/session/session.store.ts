import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface SessionState {
  user: UserInfo | null;
  roles: string[];
  permissions: string[];
  activeBranch: string | null;
  isAuthenticated: boolean;
}

const initialState: SessionState = {
  user: null,
  roles: [],
  permissions: [],
  activeBranch: null,
  isAuthenticated: false,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSession(user: UserInfo, roles: string[], permissions: string[], activeBranch: string | null) {
      patchState(store, {
        user,
        roles,
        permissions,
        activeBranch,
        isAuthenticated: true,
      });
    },
    clearSession() {
      patchState(store, initialState);
    },
    setActiveBranch(branchId: string) {
      patchState(store, { activeBranch: branchId });
    }
  }))
);
