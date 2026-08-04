import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { SolicitudesDistribuidoraApiService } from '../data-access/solicitudes-distribuidora-api.service';
import { SolicitudDistribuidora } from '../models/solicitud-distribuidora.model';

export interface SolicitudesListadoState {
  datos: SolicitudDistribuidora[];
  paginacion: {
    paginaActiva: number;
    ultimaPagina: number;
    porPagina: number;
    total: number;
  };
  filtros: Record<string, string>;
  estadoCarga: boolean;
  error: string | null;
}

const initialState: SolicitudesListadoState = {
  datos: [],
  paginacion: { paginaActiva: 1, ultimaPagina: 1, porPagina: 10, total: 0 },
  filtros: {},
  estadoCarga: false,
  error: null
};

export const SolicitudesListadoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(SolicitudesDistribuidoraApiService);

    return {
      async listar(pagina: number = 1, porPagina: number = 10, filtros?: Record<string, string>) {
        patchState(store, { estadoCarga: true, error: null });
        try {
          const res = await firstValueFrom(service.listarSolicitudes(pagina, porPagina, filtros));
          patchState(store, {
            datos: res.datos,
            paginacion: { paginaActiva: res.paginaActiva, ultimaPagina: res.ultimaPagina, porPagina: res.porPagina, total: res.total },
            filtros: filtros || {},
            estadoCarga: false
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al cargar el listado' });
        }
      },

      limpiarStore() {
        patchState(store, initialState);
      }
    };
  })
);
