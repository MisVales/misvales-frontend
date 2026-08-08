import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { PeriodosCanjeService } from '../data-access/exchange-periods.service';
import { PeriodoCanjeDTO } from '../data-access/exchange-periods.dtos';

export interface PeriodosCanjeFiltros {
  estado?: string;
}

export interface PeriodosCanjeState {
  datos: PeriodoCanjeDTO[];
  periodoSeleccionado: PeriodoCanjeDTO | null;
  filtros: PeriodosCanjeFiltros;
  paginacion: {
    pagina: number;
    total: number;
    porPagina: number;
  };
  estadoCarga: boolean;
  error: string | null;
  versionRegistro: number;
  operacionEnProceso: string | null;
}

const initialState: PeriodosCanjeState = {
  datos: [],
  periodoSeleccionado: null,
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
  versionRegistro: 0,
  operacionEnProceso: null
};

export const PeriodosCanjeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(PeriodosCanjeService);

    return {
      async listar(pagina: number = 1, porPagina: number = 10, estado?: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'listar' });
        try {
          const res = await firstValueFrom(service.listar(pagina, porPagina, estado));
          patchState(store, {
            datos: res.datos,
            paginacion: { pagina: res.pagina, total: res.total, porPagina: res.porPagina },
            filtros: { estado },
            estadoCarga: false,
            operacionEnProceso: null
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al listar periodos', operacionEnProceso: null });
        }
      },

      async crearPeriodo(datos: import('../data-access/exchange-periods.dtos').CrearPeriodoDTO) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crearPeriodo' });
        try {
          await firstValueFrom(service.crearPeriodo(datos));
          this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().estado);
          patchState(store, { operacionEnProceso: 'crearPeriodoSuccess' });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al crear periodo', operacionEnProceso: null });
        }
      },

      async modificarBorrador(id: string, datos: import('../data-access/exchange-periods.dtos').ModificarPeriodoDTO, versionRegistro: number) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'modificarBorrador' });
        try {
          await firstValueFrom(service.modificarBorrador(id, datos, versionRegistro));
          this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().estado);
          patchState(store, { operacionEnProceso: 'modificarBorradorSuccess' });
        } catch (err: any) {
          this.manejarErrorConcurrencia(err, 'Error al modificar borrador');
        }
      },

      async consultarDetalle(id: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'consultarDetalle' });
        try {
          const res = await firstValueFrom(service.consultarDetalle(id));
          patchState(store, { 
            periodoSeleccionado: res, 
            versionRegistro: res.versionRegistro,
            estadoCarga: false, 
            operacionEnProceso: null 
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al consultar detalle del periodo', operacionEnProceso: null });
        }
      },

      manejarErrorConcurrencia(err: any, mensajePorDefecto: string) {
        if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
          patchState(store, { 
            estadoCarga: false, 
            error: 'Conflicto de concurrencia: El periodo ha sido modificado por otro usuario. Por favor, recargue la página.', 
            operacionEnProceso: null 
          });
        } else {
          patchState(store, { estadoCarga: false, error: err?.error?.message || mensajePorDefecto, operacionEnProceso: null });
        }
      },

      limpiarError() {
        patchState(store, { error: null });
      },

      limpiarStore() {
        patchState(store, initialState);
      }
    };
  })
);
