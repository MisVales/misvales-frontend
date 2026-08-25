import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ConfiguracionesService } from '../data-access/configuraciones.service';
import { ConfiguracionesMapper } from '../data-access/configuraciones.mapper';
import { 
  ConfiguracionDefinicion, 
  ConfiguracionVersion, 
  CreateConfigurationVersionRequestDto, 
  UpdateCurrentConfigurationRequestDto,
  UpdateConfigurationVersionRequestDto 
} from '../data-access/configuraciones.dtos';

type ErrorApiConfiguracion = {
  message?: string;
  error?: { message?: string; code?: string };
};

/** Obtiene el mensaje de la envoltura estándar de errores de la API. */
export function mensajeErrorConfiguracion(error: unknown, mensajePorDefecto: string): string {
  const respuesta = (error as { error?: ErrorApiConfiguracion } | null)?.error;
  return respuesta?.error?.message ?? respuesta?.message ?? mensajePorDefecto;
}

export interface ConfiguracionesFiltros {
  grupo?: string;
  estado?: string;
}

export interface ConfiguracionesState {
  definiciones: ConfiguracionDefinicion[];
  definicionSeleccionada: ConfiguracionDefinicion | null;
  versiones: ConfiguracionVersion[];
  filtros: ConfiguracionesFiltros;
  paginacion: {
    pagina: number;
    total: number;
    porPagina: number;
  };
  estadoCarga: boolean;
  error: string | null;
  operacionEnProceso: string | null;
}

const initialState: ConfiguracionesState = {
  definiciones: [],
  definicionSeleccionada: null,
  versiones: [],
  filtros: {},
  paginacion: { pagina: 1, total: 0, porPagina: 10 },
  estadoCarga: false,
  error: null,
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
          const res = await firstValueFrom(service.listar());
          patchState(store, {
            definiciones: res.map(ConfiguracionesMapper.fromDefinitionDto),
            paginacion: { pagina, total: res.length, porPagina },
            filtros: { grupo, estado },
            estadoCarga: false,
            operacionEnProceso: null
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, 'Error al listar configuraciones'), operacionEnProceso: null });
        }
      },
      
      async consultarDefinicion(clave: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'consultarDefinicion' });
        try {
          const res = await firstValueFrom(service.consultarDefinicion(clave));
          patchState(store, { definicionSeleccionada: ConfiguracionesMapper.fromDefinitionDto(res), estadoCarga: false, operacionEnProceso: null });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, 'Error al consultar definición'), operacionEnProceso: null });
        }
      },

      async consultarVersiones(clave: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'consultarVersiones' });
        try {
          const res = await firstValueFrom(service.consultarVersiones(clave));
          patchState(store, {
            versiones: res.map(ConfiguracionesMapper.fromVersionDto),
            estadoCarga: false,
            operacionEnProceso: null
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, 'Error al consultar versiones'), operacionEnProceso: null });
        }
      },

      async crearVersion(clave: string, datos: CreateConfigurationVersionRequestDto) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'crearVersion' });
        try {
          await firstValueFrom(service.crearVersion(clave, datos));
          // Recargar versiones
          await this.consultarVersiones(clave);
          patchState(store, { estadoCarga: false, operacionEnProceso: 'crearVersionSuccess' });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, 'Error al crear versión'), operacionEnProceso: null });
        }
      },

      async actualizarActual(clave: string, datos: UpdateCurrentConfigurationRequestDto) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'actualizarActual' });
        try {
          await firstValueFrom(service.actualizarActual(clave, datos));
          const [definicion, versiones, definiciones] = await Promise.all([
            firstValueFrom(service.consultarDefinicion(clave)),
            firstValueFrom(service.consultarVersiones(clave)),
            firstValueFrom(service.listar()),
          ]);
          patchState(store, {
            definicionSeleccionada: ConfiguracionesMapper.fromDefinitionDto(definicion),
            versiones: versiones.map(ConfiguracionesMapper.fromVersionDto),
            definiciones: definiciones.map(ConfiguracionesMapper.fromDefinitionDto),
            estadoCarga: false,
            operacionEnProceso: 'actualizarActualSuccess',
          });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, 'No se pudieron guardar los cambios.'), operacionEnProceso: null });
        }
      },

      async modificarVersion(idVersion: string, datos: UpdateConfigurationVersionRequestDto) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'modificarVersion' });
        try {
          await firstValueFrom(service.modificarVersion(idVersion, datos));
          if (store.definicionSeleccionada()) {
            await this.consultarVersiones(store.definicionSeleccionada()!.clave);
          }
          patchState(store, { operacionEnProceso: 'modificarVersionSuccess' });
        } catch (err: any) {
          this.manejarErrorConcurrencia(err, 'Error al modificar versión');
        }
      },

      async publicarVersion(idVersion: string, versionRegistro: number, motivo: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'publicarVersion' });
        try {
          await firstValueFrom(service.publicarVersion(idVersion, versionRegistro, motivo));
          if (store.definicionSeleccionada()) {
            await this.consultarVersiones(store.definicionSeleccionada()!.clave);
          }
          patchState(store, { operacionEnProceso: 'publicarVersionSuccess' });
        } catch (err: any) {
          this.manejarErrorConcurrencia(err, 'Error al publicar versión');
        }
      },

      async desactivarVersion(idVersion: string, versionRegistro: number, motivo: string) {
        patchState(store, { estadoCarga: true, error: null, operacionEnProceso: 'desactivarVersion' });
        try {
          await firstValueFrom(service.desactivarVersion(idVersion, versionRegistro, motivo));
          if (store.definicionSeleccionada()) {
            await this.consultarVersiones(store.definicionSeleccionada()!.clave);
          }
          patchState(store, { operacionEnProceso: 'desactivarVersionSuccess' });
        } catch (err: any) {
          this.manejarErrorConcurrencia(err, 'Error al desactivar versión');
        }
      },

      manejarErrorConcurrencia(err: any, mensajePorDefecto: string) {
        if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
          // Forzar la recarga de los datos de la vista actual si hubo un conflicto de concurrencia
          if (store.definicionSeleccionada()) {
            this.consultarVersiones(store.definicionSeleccionada()!.clave);
          }
          patchState(store, { 
            estadoCarga: false, 
            error: 'Conflicto de concurrencia: El registro ha sido modificado por otro usuario. Se ha recargado la versión más reciente.', 
            operacionEnProceso: null 
          });
        } else {
          patchState(store, { estadoCarga: false, error: mensajeErrorConfiguracion(err, mensajePorDefecto), operacionEnProceso: null });
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
