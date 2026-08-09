import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { PeriodoCanje, CreateExchangePeriodRequestDto, UpdateExchangePeriodRequestDto } from '../data-access/periodos-canje.dtos';
import { PeriodosCanjeMapper } from '../data-access/periodos-canje.mapper';
import { PeriodosCanjeService } from '../data-access/periodos-canje.service';
import { firstValueFrom } from 'rxjs';

export interface PeriodosCanjeFiltros {
  estado?: string;
}

export interface PeriodosCanjeState {
  datos: PeriodoCanje[];
  filtros: PeriodosCanjeFiltros;
  paginacion: { pagina: number; total: number; porPagina: number; };
  estadoCarga: boolean;
  error: string | null;
  operacionEnProceso: string | null;
}

const initialState: PeriodosCanjeState = {
  datos: [],
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
  operacionEnProceso: null,
};

export const PeriodosCanjeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, service = inject(PeriodosCanjeService)) => ({
    
    async listar(pagina: number = 1, porPagina: number = 10, estado?: string) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'listar' });
      try {
        const res = await firstValueFrom(service.listar(pagina, porPagina, estado));
        patchState(store, {
          datos: res.data.map(PeriodosCanjeMapper.fromDto),
          paginacion: { pagina: res.meta.current_page, total: res.meta.total, porPagina },
          filtros: { estado },
          estadoCarga: false,
          operacionEnProceso: null
        });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al listar periodos', operacionEnProceso: null });
      }
    },

    async crear(datos: CreateExchangePeriodRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crear' });
      try {
        await firstValueFrom(service.crear(datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().estado);
        patchState(store, { operacionEnProceso: 'crearSuccess' });
      } catch (err: any) {
        patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al crear periodo', operacionEnProceso: null });
      }
    },

    async actualizar(id: string, datos: UpdateExchangePeriodRequestDto) {
      patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'actualizar' });
      try {
        await firstValueFrom(service.actualizar(id, datos));
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().estado);
        patchState(store, { operacionEnProceso: 'actualizarSuccess' });
      } catch (err: any) {
        this.manejarErrorConcurrencia(err, 'Error al actualizar periodo');
      }
    },

    manejarErrorConcurrencia(err: any, mensajePorDefecto: string) {
      if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
        this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().estado);
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
