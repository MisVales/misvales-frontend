import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { VerificacionDistribuidorasApiService } from '../data-access/api/verificacion-distribuidoras-api.service';
import { initialVerificacionDistribuidorasState } from './verificacion-distribuidoras.store';
import { mapSolicitudToModel, mapVisitaToModel } from '../data-access/mappers/verificacion-distribuidoras.mappers';
import { HttpErrorResponse } from '@angular/common/http';
import { 
  ActualizarVisitaRequestDto, 
  AplicarCorreccionRequestDto, 
  AsignarVerificadorRequestDto, 
  AutorizarSolicitudRequestDto, 
  DevolverSolicitudCapturaRequestDto, 
  EvaluarSolicitudRequestDto, 
  FinalizarCorreccionesRequestDto, 
  FinalizarVisitaRequestDto, 
  IniciarVisitaRequestDto 
} from '../data-access/dtos/verificacion-distribuidoras.dtos';

export const VerificacionDistribuidorasFacade = signalStore(
  { providedIn: 'root' },
  withState(initialVerificacionDistribuidorasState),
  withMethods((store) => {
    const apiService = inject(VerificacionDistribuidorasApiService);

    const handleError = (err: any) => {
      let errorMsg = 'Ha ocurrido un error inesperado.';
      let isConflict = false;
      let isDenied = false;

      if (err instanceof HttpErrorResponse) {
        if (err.status === 409) {
          errorMsg = 'Conflicto de versión: Los datos han sido modificados por otro usuario. Por favor, recarga la página.';
          isConflict = true;
        } else if (err.status === 403) {
          errorMsg = 'Acceso denegado a esta operación.';
          isDenied = true;
        } else if (err.error?.error?.message) {
          errorMsg = err.error.error.message;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
      }

      patchState(store, { 
        isLoading: false, 
        isUploading: false,
        error: errorMsg,
        conflictoVersion: isConflict,
        accesoDenegado: isDenied
      });
      return false;
    };

    return {
      // --------------------------------------------------
      // SOLICITUDES
      // --------------------------------------------------
      async cargarSolicitudes(page: number = 1, perPage: number = 10, status?: string, search?: string) {
        patchState(store, { isLoading: true, error: null, conflictoVersion: false, accesoDenegado: false });
        try {
          const response = await firstValueFrom(apiService.listarSolicitudes({ page, perPage, status, search }));
          patchState(store, {
            solicitudes: response.data.map(mapSolicitudToModel),
            totalSolicitudes: response.total,
            pageSolicitudes: response.page,
            perPageSolicitudes: response.perPage,
            isLoading: false
          });
        } catch (err) {
          handleError(err);
        }
      },

      async cargarSolicitud(id: string) {
        patchState(store, { isLoading: true, error: null, conflictoVersion: false, accesoDenegado: false });
        try {
          const response = await firstValueFrom(apiService.consultarSolicitud(id));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
        } catch (err) {
          handleError(err);
        }
      },

      async devolverACaptura(id: string, req: DevolverSolicitudCapturaRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.devolverACaptura(id, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async asignarVerificador(id: string, req: AsignarVerificadorRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.asignarVerificador(id, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async cargarVerificadoresDisponibles() {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.listarVerificadoresDisponibles());
          patchState(store, {
            verificadoresDisponibles: response.map(v => ({
              id: v.id,
              nombreCompleto: v.nombre_completo,
              sucursalId: v.sucursal_id,
              estado: v.estado as 'ACTIVE' | 'INACTIVE'
            })),
            isLoading: false
          });
        } catch (err) {
          handleError(err);
        }
      },

      // --------------------------------------------------
      // VISITAS Y EVIDENCIAS
      // --------------------------------------------------
      async cargarVisitasAsignadas(page: number = 1, perPage: number = 10, status?: string, search?: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.listarVisitasAsignadas({ page, perPage, status, search }));
          patchState(store, {
            visitasAsignadas: response.data.map(mapVisitaToModel),
            totalVisitas: response.total,
            pageVisitas: response.page,
            perPageVisitas: response.perPage,
            isLoading: false
          });
        } catch (err) {
          handleError(err);
        }
      },

      async cargarVisita(id: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.consultarVisita(id));
          patchState(store, {
            visitaSeleccionada: mapVisitaToModel(response),
            isLoading: false
          });
        } catch (err) {
          handleError(err);
        }
      },

      async iniciarVisita(id: string, req: IniciarVisitaRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.iniciarVisita(id, req));
          patchState(store, {
            visitaSeleccionada: mapVisitaToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async actualizarVisita(id: string, req: ActualizarVisitaRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.actualizarVisita(id, req));
          patchState(store, {
            visitaSeleccionada: mapVisitaToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async finalizarVisita(id: string, req: FinalizarVisitaRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.finalizarVisita(id, req));
          patchState(store, {
            visitaSeleccionada: mapVisitaToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async adjuntarEvidencia(visitaId: string, tipo: string, file: File, lockVersion: number) {
        patchState(store, { isUploading: true, uploadProgress: 0, error: null });
        return new Promise<boolean>((resolve) => {
          apiService.adjuntarEvidencia(visitaId, tipo, file, lockVersion).subscribe({
            next: (res) => {
              patchState(store, { uploadProgress: res.progress });
              if (res.data) {
                // If we get the final response data, fetch the visit again to get updated lock_version and evidences list
                this.cargarVisita(visitaId).then(() => {
                  patchState(store, { isUploading: false, uploadProgress: 0 });
                  resolve(true);
                });
              }
            },
            error: (err) => {
              handleError(err);
              resolve(false);
            }
          });
        });
      },

      async eliminarEvidencia(visitaId: string, evidenciaId: string, lockVersion: number) {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(apiService.eliminarEvidencia(visitaId, evidenciaId, lockVersion));
          // Refetch to ensure state is in sync with server
          await this.cargarVisita(visitaId);
          patchState(store, { isLoading: false });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async descargarEvidenciaBlob(visitaId: string, evidenciaId: string): Promise<Blob | null> {
        patchState(store, { isLoading: true, error: null });
        try {
          const blob = await firstValueFrom(apiService.descargarEvidencia(visitaId, evidenciaId));
          patchState(store, { isLoading: false });
          return blob;
        } catch (err) {
          handleError(err);
          return null;
        }
      },

      // --------------------------------------------------
      // CORRECCIONES, EVALUACION Y AUTORIZACION
      // --------------------------------------------------
      async aplicarCorreccion(solicitudId: string, req: AplicarCorreccionRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.aplicarCorreccion(solicitudId, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async finalizarCorrecciones(solicitudId: string, req: FinalizarCorreccionesRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.finalizarCorrecciones(solicitudId, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async evaluarSolicitud(solicitudId: string, req: EvaluarSolicitudRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.evaluarSolicitud(solicitudId, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      async autorizarSolicitud(solicitudId: string, req: AutorizarSolicitudRequestDto) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(apiService.autorizarSolicitud(solicitudId, req));
          patchState(store, {
            solicitudSeleccionada: mapSolicitudToModel(response),
            isLoading: false
          });
          return true;
        } catch (err) {
          return handleError(err);
        }
      },

      // --------------------------------------------------
      // UTILIDADES
      // --------------------------------------------------
      limpiarSeleccion() {
        patchState(store, { solicitudSeleccionada: null, visitaSeleccionada: null, error: null });
      },

      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);
