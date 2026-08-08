import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { OrganizationApiService } from '../data-access/organization-api.service';
import { Branch, CreateBranchPayload, UpdateBranchPayload } from '../data-access/organization.dtos';

export interface OrganizationState {
  branches: Branch[];
  selectedBranch: Branch | null;
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
}

const initialOrganizationState: OrganizationState = {
  branches: [],
  selectedBranch: null,
  total: 0,
  page: 1,
  perPage: 10,
  isLoading: false,
  error: null,
};

export const OrganizationFacade = signalStore(
  { providedIn: 'root' },
  withState(initialOrganizationState),
  withMethods((store) => {
    const apiService = inject(OrganizationApiService);

    return {
      async loadBranches(page: number = 1, perPage: number = 10, search?: string, status?: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          // The API now returns the full array. We can simulate pagination client-side or just store all.
          const response = await firstValueFrom(apiService.getBranches());
          patchState(store, {
            branches: response,
            total: response.length,
            page: 1,
            perPage: response.length,
            isLoading: false
          });
        } catch (err: any) {
          patchState(store, { isLoading: false, error: err?.error?.message || 'Error al cargar sucursales' });
        }
      },

      async getBranchById(id: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          // Find locally since getBranchById is not in API spec
          // Or wait, if we must get it from API, the spec doesn't define GET /api/v1/branches/{id}.
          // Let's fallback to searching in the currently loaded branches array
          const branches = store.branches();
          const branch = branches.find(b => b.id === id) || null;
          if (branch) {
            patchState(store, { selectedBranch: branch, isLoading: false });
          } else {
             patchState(store, { isLoading: false, error: 'Sucursal no encontrada' });
          }
        } catch (err: any) {
          patchState(store, { isLoading: false, error: err?.error?.message || 'Error al obtener la sucursal' });
        }
      },

      async createBranch(data: CreateBranchPayload) {
        patchState(store, { isLoading: true, error: null });
        try {
          const newBranch = await firstValueFrom(apiService.createBranch(data));
          patchState(store, (state) => ({
            branches: [newBranch, ...state.branches],
            total: state.total + 1,
            isLoading: false
          }));
          return true;
        } catch (err: any) {
          patchState(store, { isLoading: false, error: err?.error?.message || 'Error al crear la sucursal' });
          return false;
        }
      },

      async updateBranch(id: string, data: UpdateBranchPayload) {
        patchState(store, { isLoading: true, error: null });
        try {
          const updatedBranch = await firstValueFrom(apiService.updateBranch(id, data));
          patchState(store, (state) => ({
            branches: state.branches.map(b => b.id === id ? updatedBranch : b),
            selectedBranch: state.selectedBranch?.id === id ? updatedBranch : state.selectedBranch,
            isLoading: false
          }));
          return true;
        } catch (err: any) {
          if (err?.status === 409) {
            patchState(store, { isLoading: false, error: 'Conflicto de concurrencia: Alguien más actualizó esta sucursal al mismo tiempo. Por favor, recargue y vuelva a intentarlo.' });
          } else {
            patchState(store, { isLoading: false, error: err?.error?.message || 'Error al actualizar la sucursal' });
          }
          return false;
        }
      },

      async toggleBranchStatus(id: string, isActive: boolean) {
        patchState(store, { isLoading: true, error: null });
        try {
          const status = isActive ? 'ACTIVE' : 'INACTIVE';
          const updatedBranch = await firstValueFrom(apiService.toggleBranchStatus(id, { status }));
          patchState(store, (state) => ({
            branches: state.branches.map(b => b.id === id ? updatedBranch : b),
            selectedBranch: state.selectedBranch?.id === id ? updatedBranch : state.selectedBranch,
            isLoading: false
          }));
          return true;
        } catch (err: any) {
          if (err?.status === 409) {
            patchState(store, { isLoading: false, error: 'Conflicto de concurrencia: Alguien más actualizó esta sucursal al mismo tiempo.' });
          } else {
            patchState(store, { isLoading: false, error: err?.error?.message || 'Error al cambiar el estado de la sucursal' });
          }
          return false;
        }
      },

      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);
