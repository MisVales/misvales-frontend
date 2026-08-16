import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { SolicitudesDistribuidoraApiService } from '../data-access/solicitudes-distribuidora-api.service';
import { SolicitudDistribuidora } from '../models/solicitud-distribuidora.model';
import { CrearSolicitudRequestDTO } from '../data-access/dtos/solicitud-distribuidora-request.dto';

export interface SolicitudDetalleState {
  detalle: SolicitudDistribuidora | null;
  estadoCarga: boolean;
  guardandoSeccion: boolean;
  enviandoRevision: boolean;
  error: string | null;
  errorConcurrencia: boolean;
}

const initialState: SolicitudDetalleState = {
  detalle: null,
  estadoCarga: false,
  guardandoSeccion: false,
  enviandoRevision: false,
  error: null,
  errorConcurrencia: false
};

export const SolicitudDetalleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(SolicitudesDistribuidoraApiService);

    const manejarErrorConcurrencia = (err: any, mensajePorDefecto: string) => {
      if (err?.status === 409 || err?.error?.code === 'RESOURCE_VERSION_CONFLICT') {
        patchState(store, { error: 'El expediente fue modificado por otro usuario. Recarga la información antes de continuar.', errorConcurrencia: true });
      } else {
        patchState(store, { error: err?.error?.message || mensajePorDefecto });
      }
    };

    return {
      async cargarDetalle(id: string) {
        patchState(store, { estadoCarga: true, error: null, errorConcurrencia: false });
        try {
          const detalle = await firstValueFrom(service.consultarSolicitud(id));
          patchState(store, { detalle, estadoCarga: false });
        } catch (err: any) {
          patchState(store, { estadoCarga: false, error: err?.error?.message || 'Error al cargar detalle' });
        }
      },

      async crearSolicitud(datos: CrearSolicitudRequestDTO) {
        patchState(store, { guardandoSeccion: true, error: null });
        try {
          const detalle = await firstValueFrom(service.crearSolicitud(datos));
          patchState(store, { detalle, guardandoSeccion: false });
          return detalle.id;
        } catch (err: any) {
          patchState(store, { guardandoSeccion: false, error: err?.error?.message || 'Error al crear solicitud' });
          throw err;
        }
      },

      async guardarDatosPersonales(datos: any) {
        const id = store.detalle()?.id;
        const version = store.detalle()?.versionBloqueo;
        if (!id || version === undefined) return;

        patchState(store, { guardandoSeccion: true, error: null });
        try {
          const detalle = await firstValueFrom(service.guardarDatosPersonales(id, datos, version));
          patchState(store, { detalle, guardandoSeccion: false });
        } catch (err: any) {
          patchState(store, { guardandoSeccion: false });
          manejarErrorConcurrencia(err, 'Error al guardar datos personales');
          throw err;
        }
      },

      async actualizarDeclaraciones(declaraciones: Record<string, string>) {
        const id = store.detalle()?.id;
        const version = store.detalle()?.versionBloqueo;
        if (!id || version === undefined) return;

        patchState(store, { guardandoSeccion: true, error: null, errorConcurrencia: false });
        try {
          const detalle = await firstValueFrom(service.actualizarDeclaraciones(id, declaraciones, version));
          patchState(store, { detalle, guardandoSeccion: false });
        } catch (err: any) {
          patchState(store, { guardandoSeccion: false });
          manejarErrorConcurrencia(err, 'Error al actualizar el estado de la sección');
          throw err;
        }
      },

      async enviarARevision() {
        const id = store.detalle()?.id;
        const version = store.detalle()?.versionBloqueo;
        if (!id || version === undefined) return;

        patchState(store, { enviandoRevision: true, error: null });
        try {
          const detalle = await firstValueFrom(service.enviarARevision(id, version));
          patchState(store, { detalle, enviandoRevision: false });
        } catch (err: any) {
          patchState(store, { enviandoRevision: false });
          manejarErrorConcurrencia(err, 'Error al enviar a revisión');
          throw err;
        }
      },

      limpiarStore() {
        patchState(store, initialState);
      }
    };
  })
);
