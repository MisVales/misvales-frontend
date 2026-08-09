import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Producto, CreateProductRequestDto, UpdateProductRequestDto } from '../data-access/productos.dtos';
import { ProductosMapper } from '../data-access/productos.mapper';
import { ProductosService } from '../data-access/productos.service';
import { firstValueFrom } from 'rxjs';

export interface ProductosFiltros {
  busqueda?: string;
}

export interface ProductosState {
  datos: Producto[];
  filtros: ProductosFiltros;
  paginacion: { pagina: number; total: number; porPagina: number; };
  estadoCarga: boolean;
  error: string | null;
  operacionEnProceso: string | null;
}

const initialState: ProductosState = {
  datos: [],
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
  operacionEnProceso: null,
};

export const ProductosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, service = inject(ProductosService)) => ({
    
    async listar(pagina: number = 1, porPagina: number = 10, busqueda?: string) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'listar' });
      try {
        const res = await firstValueFrom(service.listar(pagina, porPagina, busqueda));
        patchState(store, {
          datos: res.data.map(ProductosMapper.fromDto),
          paginacion: { pagina: res.meta.current_page, total: res.meta.total, porPagina },
          filtros: { busqueda },
          estadoCarga: false,
          operacionEnProceso: null
        });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al listar productos', operacionEnProceso: null });
      }
    },

    async crear(datos: CreateProductRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crear' });
      try {
        await firstValueFrom(service.crear(datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'crearSuccess' });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al crear producto', operacionEnProceso: null });
      }
    },

    async actualizar(id: string, datos: UpdateProductRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'actualizar' });
      try {
        await firstValueFrom(service.actualizar(id, datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'actualizarSuccess' });
      } catch (err: any) {
        this.manejarErrorConcurrencia(err, 'Error al actualizar producto');
      }
    },

    async cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'cambiarEstado' });
      try {
        await firstValueFrom(service.cambiarEstado(id, nuevoEstado, versionRegistro));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().busqueda);
        patchState(store, { operacionEnProceso: 'cambiarEstadoSuccess' });
      } catch (err: any) {
        this.manejarErrorConcurrencia(err, 'Error al cambiar estado de producto');
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
