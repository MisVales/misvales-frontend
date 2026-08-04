import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, pipe, tap, of } from 'rxjs';
import { Producto } from '../../../core/models/catalogos.models';
import { PaginationMeta } from '../../../core/api/models/api.dtos';
import { ProductosService } from '../data-access/productos.service';
import { ProductoReq } from '../../../core/api/models/catalogos.dtos';
import { CatalogosMapper } from '../../../core/mappers/catalogos.mapper';

export interface ProductosFiltros {
  nombre?: string;
  estado?: string;
  vigencia?: string;
  montoNominal?: string;
}

export interface ProductosState {
  datos: Producto[];
  filtros: ProductosFiltros;
  paginacion: PaginationMeta;
  estadoCarga: boolean;
  error: string | null;
  versionRegistro: number | null;
  operacionEnProceso: 'crear' | 'modificar' | 'publicar' | 'desactivar' | 'ninguna';
}

const initialState: ProductosState = {
  datos: [],
  filtros: {},
  paginacion: { current_page: 1, from: 0, last_page: 1, path: '', per_page: 10, to: 0, total: 0 },
  estadoCarga: false,
  error: null,
  versionRegistro: null,
  operacionEnProceso: 'ninguna',
};

export const ProductosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productosService = inject(ProductosService)) => ({
    actualizarFiltros(filtros: Partial<ProductosFiltros>) {
      patchState(store, (state) => ({ filtros: { ...state.filtros, ...filtros } }));
    },

    limpiarFormulario() {
      patchState(store, { operacionEnProceso: 'ninguna', error: null, versionRegistro: null });
    },

    cargarProductos: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { estadoCarga: true, error: null })),
        exhaustMap(() =>
          productosService.listar(store.filtros(), store.paginacion().current_page).pipe(
            tap((res: { data: any[]; meta: PaginationMeta }) => {
              patchState(store, {
                datos: res.data.map(CatalogosMapper.mapProductoResToModel),
                paginacion: res.meta,
                estadoCarga: false,
              });
            }),
            catchError((err: any) => {
              patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al cargar productos' });
              return of([]);
            })
          )
        )
      )
    ),

    crearProducto: rxMethod<ProductoReq>(
      pipe(
        tap(() => patchState(store, { operacionEnProceso: 'crear', error: null })),
        exhaustMap((req) =>
          productosService.crear(req).pipe(
            tap((res: any) => {
              patchState(store, { operacionEnProceso: 'ninguna' });
            }),
            catchError((err: any) => {
              patchState(store, { operacionEnProceso: 'ninguna', error: err?.error?.message || 'Error al crear producto' });
              return of(null);
            })
          )
        )
      )
    ),
  }))
);
