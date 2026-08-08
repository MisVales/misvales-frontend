import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DistribuidorasApiService } from '../data-access/api/distribuidoras-api.service';
import { Distribuidora } from '../models/distribuidora.model';
import { FiltroDistribuidoras } from '../models/filtro-distribuidoras.model';
import { firstValueFrom } from 'rxjs';

export interface DistribuidorasState {
  listado: Distribuidora[];
  detalle: Distribuidora | null;
  filtros: FiltroDistribuidoras;
  paginacion: {
    paginaActiva: number;
    ultimaPagina: number;
    porPagina: number;
    total: number;
  };
  cargandoListado: boolean;
  cargandoDetalle: boolean;
  activando: boolean;
  asignandoCategoria: boolean;
  reenviandoInvitacion: boolean;
  error: string | null;
  conflictoVersion: boolean;
  ultimoRequestId: string | null;
}

const initialState: DistribuidorasState = {
  listado: [],
  detalle: null,
  filtros: {},
  paginacion: {
    paginaActiva: 1,
    ultimaPagina: 1,
    porPagina: 10,
    total: 0
  },
  cargandoListado: false,
  cargandoDetalle: false,
  activando: false,
  asignandoCategoria: false,
  reenviandoInvitacion: false,
  error: null,
  conflictoVersion: false,
  ultimoRequestId: null
};

export const DistribuidorasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(DistribuidorasApiService)) => ({
    
    async listar(pagina: number = 1, porPagina: number = 10, filtros?: FiltroDistribuidoras) {
      patchState(store, { cargandoListado: true, error: null });
      try {
        const res = await firstValueFrom(api.listar(pagina, porPagina, filtros));
        patchState(store, {
          listado: res.datos,
          paginacion: {
            paginaActiva: res.paginaActiva,
            ultimaPagina: res.ultimaPagina,
            porPagina: res.porPagina,
            total: res.total
          },
          filtros: filtros || store.filtros(),
          cargandoListado: false
        });
      } catch (e: any) {
        patchState(store, { cargandoListado: false, error: e.message || 'Error al cargar listado' });
      }
    },

    async cargarDetalle(id: string) {
      patchState(store, { cargandoDetalle: true, error: null, conflictoVersion: false });
      try {
        const detalle = await firstValueFrom(api.obtener(id));
        patchState(store, { detalle, cargandoDetalle: false });
      } catch (e: any) {
        patchState(store, { cargandoDetalle: false, error: e.message || 'Error al cargar detalle' });
      }
    },

    limpiarDetalle() {
      patchState(store, { detalle: null, error: null, conflictoVersion: false });
    },

    manejarErrorConcurrencia(e: any) {
      if (e?.status === 409) {
        patchState(store, { conflictoVersion: true, error: 'El registro fue modificado por otro usuario. Recarga para continuar.' });
      } else {
        patchState(store, { error: e.error?.message || e.message || 'Ocurrió un error inesperado.' });
      }
    }
  }))
);
