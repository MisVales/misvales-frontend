import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, pipe, tap, of } from 'rxjs';
import { Categoria, CreateCategoryRequestDto, UpdateCategoryRequestDto } from '../data-access/categorias.dtos';
import { CategoriasMapper } from '../data-access/categorias.mapper';
import { CategoriasService } from '../data-access/categorias.service';
import { firstValueFrom } from 'rxjs';

export interface CategoriasFiltros {
  busqueda?: string;
}

export interface CategoriasState {
  datos: Categoria[];
  filtros: CategoriasFiltros;
  paginacion: { pagina: number; total: number; porPagina: number; };
  estadoCarga: boolean;
  error: string | null;
  operacionEnProceso: string | null;
}

const initialState: CategoriasState = {
  datos: [],
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
  operacionEnProceso: null,
};

export const CategoriasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, categoriasService = inject(CategoriasService)) => ({
    
    async listar(pagina: number = 1, porPagina: number = 10, busqueda?: string) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'listar' });
      try {
        const res = await firstValueFrom(categoriasService.listar(pagina, porPagina, busqueda));
        patchState(store, {
          datos: res.data.map(CategoriasMapper.fromDto),
          paginacion: { pagina: res.meta.current_page, total: res.meta.total, porPagina },
          filtros: { busqueda },
          estadoCarga: false,
          operacionEnProceso: null
        });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al listar categorías', operacionEnProceso: null });
      }
    },

    async crear(datos: CreateCategoryRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crear' });
      try {
        await firstValueFrom(categoriasService.crear(datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'crearSuccess' });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al crear categoría', operacionEnProceso: null });
      }
    },

    async actualizar(id: string, datos: UpdateCategoryRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'actualizar' });
      try {
        await firstValueFrom(categoriasService.actualizar(id, datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'actualizarSuccess' });
      } catch (err: any) {
        this.manejarErrorConcurrencia(err, 'Error al actualizar categoría');
      }
    },

    async cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'cambiarEstado' });
      try {
        await firstValueFrom(categoriasService.cambiarEstado(id, nuevoEstado, versionRegistro));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'cambiarEstadoSuccess' });
      } catch (err: any) {
        this.manejarErrorConcurrencia(err, 'Error al cambiar estado de categoría');
      }
    },

    manejarErrorConcurrencia(err: any, mensajePorDefecto: string) {
      if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { 
          estadoCarga: false, 
          error: 'Conflicto de concurrencia: El registro ha sido modificado por otro usuario. Se ha recargado la lista.', 
          operacionEnProceso: null 
        });
      } else {
        patchState(store, { estadoCarga: false, error: err?.error?.message || mensajePorDefecto, operacionEnProceso: null });
      }
    },

    limpiarError() {
      patchState(store, { error: null });
    }
  }))
);
