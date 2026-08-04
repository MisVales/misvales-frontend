import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, pipe, tap, of } from 'rxjs';
import { Categoria } from '../../../core/models/catalogos.models';
import { PaginationMeta } from '../../../core/api/models/api.dtos';
import { CategoriasService } from '../data-access/categorias.service';
import { CategoriaReq } from '../../../core/api/models/catalogos.dtos';
import { CatalogosMapper } from '../../../core/mappers/catalogos.mapper';

export interface CategoriasFiltros {
  nombre?: string;
  estado?: string;
  vigencia?: string; // 'vigente', 'futura'
}

export interface CategoriasState {
  datos: Categoria[];
  filtros: CategoriasFiltros;
  paginacion: PaginationMeta;
  estadoCarga: boolean;
  error: string | null;
  versionRegistro: number | null;
  operacionEnProceso: 'crear' | 'modificar' | 'publicar' | 'desactivar' | 'ninguna';
}

const initialState: CategoriasState = {
  datos: [],
  filtros: {},
  paginacion: { current_page: 1, from: 0, last_page: 1, path: '', per_page: 10, to: 0, total: 0 },
  estadoCarga: false,
  error: null,
  versionRegistro: null,
  operacionEnProceso: 'ninguna',
};

export const CategoriasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, categoriasService = inject(CategoriasService)) => ({
    actualizarFiltros(filtros: Partial<CategoriasFiltros>) {
      patchState(store, (state) => ({ filtros: { ...state.filtros, ...filtros } }));
    },
    
    limpiarFormulario() {
      patchState(store, { operacionEnProceso: 'ninguna', error: null, versionRegistro: null });
    },

    cargarCategorias: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { estadoCarga: true, error: null })),
        exhaustMap(() =>
          categoriasService.listar(store.filtros(), store.paginacion().current_page).pipe(
            tap((res: { data: any[]; meta: PaginationMeta }) => {
              patchState(store, {
                datos: res.data.map(CatalogosMapper.mapCategoriaResToModel),
                paginacion: res.meta,
                estadoCarga: false,
              });
            }),
            catchError((err: any) => {
              patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al cargar categorías' });
              return of([]);
            })
          )
        )
      )
    ),

    crearCategoria: rxMethod<CategoriaReq>(
      pipe(
        tap(() => patchState(store, { operacionEnProceso: 'crear', error: null })),
        exhaustMap((req) =>
          categoriasService.crear(req).pipe(
            tap((res: any) => {
              patchState(store, { operacionEnProceso: 'ninguna' });
            }),
            catchError((err: any) => {
              patchState(store, { operacionEnProceso: 'ninguna', error: err?.error?.message || 'Error al crear categoría' });
              return of(null);
            })
          )
        )
      )
    ),
    
    // Add more methods like modificar, publicar, desactivar similarly...
  }))
);
