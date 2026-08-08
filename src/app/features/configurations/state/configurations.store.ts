import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ConfiguracionesService } from '../data-access/configurations.service';
import { ConfiguracionDTO, HistorialVersionesDTO } from '../data-access/configurations.dtos';

export interface ConfiguracionesFiltros {
  grupo?: string;
  estado?: string;
}

export interface ConfiguracionesState {
  datos: ConfiguracionDTO[];
  historialVigente: HistorialVersionesDTO[];
  filtros: ConfiguracionesFiltros;
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

const initialState: ConfiguracionesState = {
  datos: [],
  historialVigente: [],
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
  versionRegistro: 0,
  operacionEnProceso: null
};

export const ConfiguracionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(ConfiguracionesService);

    return {
      async listar(pagina: number = 1, porPagina: number = 10, grupo?: string, estado?: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'listar' });
        try {
          const res = await firstValueFrom(service.listar(pagina, porPagina, grupo, estado));
          patchState(store, {
            datos: res.datos,
            paginacion: { pagina: res.pagina, total: res.total, porPagina: res.porPagina },
            filtros: { grupo, estado },
            estadoCarga: false,
            operacionEnProceso: null
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al listar configuraciones', operacionEnProceso: null });
        }
      },
      async crearVersion(datos: import('../data-access/configurations.dtos').CrearVersionDTO) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crearVersion' });
        try {
          const nuevaVersion = await firstValueFrom(service.crearVersion(datos));
          // Refresh list to show new version
          this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().grupo, store.filtros().estado);
          patchState(store, { operacionEnProceso: 'crearVersionSuccess' });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al crear versión', operacionEnProceso: null });
        }
      },

      async modificarBorrador(idVersion: string, datos: import('../data-access/configurations.dtos').ModificarVersionDTO, versionRegistro: number) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'modificarBorrador' });
        try {
          const modificado = await firstValueFrom(service.modificarBorrador(idVersion, datos, versionRegistro));
          this.listar(store.paginacion().pagina, store.paginacion().porPagina, store.filtros().grupo, store.filtros().estado);
          patchState(store, { operacionEnProceso: 'modificarBorradorSuccess' });
        } catch (err: any) {
          this.manejarErrorConcurrencia(err, 'Error al modificar borrador');
        }
      },
      async consultarHistorial(clave: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'consultarHistorial' });
        try {
          const res = await firstValueFrom(service.consultarHistorial(clave));
          patchState(store, { historialVigente: res, estadoCarga: false, operacionEnProceso: null });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al consultar historial', operacionEnProceso: null });
        }
      },

      manejarErrorConcurrencia(err: any, mensajePorDefecto: string) {
        if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
          patchState(store, { 
            estadoCarga: false, 
            error: 'Conflicto de concurrencia: El registro ha sido modificado por otro usuario. Por favor, recargue la página.', 
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
