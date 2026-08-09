import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '@core/api/api-error';
import { OrganizationApiService } from '../data-access/organization-api.service';
import { Branch, CreateBranchPayload } from '../data-access/organization.dtos';

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
    const api = inject(OrganizationApiService);

    return {
      async loadBranches(page = 1, perPage = 10, search?: string, status?: string): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(api.getBranches({
            page,
            per_page: perPage,
            search: search?.trim() || undefined,
            status: status ? status.toUpperCase() : undefined,
          }));
          patchState(store, {
            branches: response.data,
            total: response.meta.total,
            page: response.meta.current_page,
            perPage: response.meta.per_page,
            isLoading: false,
          });
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: apiErrorMessage(error, 'Error al cargar sucursales.') });
        }
      },

      async getBranchById(id: string): Promise<Branch | null> {
        patchState(store, { isLoading: true, error: null, selectedBranch: null });
        try {
          const branch = await firstValueFrom(api.getBranch(id));
          patchState(store, { selectedBranch: branch, isLoading: false });
          return branch;
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: apiErrorMessage(error, 'Error al obtener la sucursal.') });
          return null;
        }
      },

      async createBranch(data: CreateBranchPayload): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          const branch = await firstValueFrom(api.createBranch(data));
          patchState(store, (state) => ({
            branches: [branch, ...state.branches],
            total: state.total + 1,
            isLoading: false,
          }));
          return true;
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: apiErrorMessage(error, 'Error al crear la sucursal.') });
          return false;
        }
      },

      async updateBranch(id: string, name: string, address: string): Promise<boolean> {
        const current = store.selectedBranch();
        if (!current || current.id !== id) return false;

        patchState(store, { isLoading: true, error: null });
        try {
          const branch = await firstValueFrom(api.updateBranch(id, {
            name,
            address,
            lock_version: current.lock_version,
          }));
          patchState(store, (state) => ({
            branches: state.branches.map((item) => item.id === id ? { ...item, ...branch } : item),
            selectedBranch: branch,
            isLoading: false,
          }));
          return true;
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: apiErrorMessage(error, 'Error al actualizar la sucursal.') });
          return false;
        }
      },

      async toggleBranchStatus(id: string, active: boolean): Promise<boolean> {
        const current = store.selectedBranch() ?? store.branches().find((branch) => branch.id === id) ?? null;
        if (!current) return false;

        patchState(store, { isLoading: true, error: null });
        try {
          const branch = await firstValueFrom(api.changeBranchStatus(current, active));
          patchState(store, (state) => ({
            branches: state.branches.map((item) => item.id === id ? { ...item, ...branch } : item),
            selectedBranch: state.selectedBranch?.id === id ? { ...state.selectedBranch, ...branch } : state.selectedBranch,
            isLoading: false,
          }));
          return true;
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: apiErrorMessage(error, 'Error al cambiar el estado de la sucursal.') });
          return false;
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
