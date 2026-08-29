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
    let guardadosPendientes: Promise<void> = Promise.resolve();
    const ejecutarEnCola = <T>(operacion: () => Promise<T>): Promise<T> => {
      const turno = guardadosPendientes.then(operacion, operacion);
      guardadosPendientes = turno.then(() => undefined, () => undefined);

      return turno;
    };

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
        return ejecutarEnCola(async () => {
          const id = store.detalle()?.id;
          const version = store.detalle()?.versionBloqueo;
          if (!id || version === undefined) return undefined;

          patchState(store, { guardandoSeccion: true, error: null });
          try {
            const resultado = await firstValueFrom(service.guardarDatosPersonales(id, datos, version));
            const detalle = store.detalle();
            if (detalle) {
              patchState(store, {
                detalle: actualizarEstadoAutoguardado(detalle, resultado),
                guardandoSeccion: false,
              });
            } else {
              patchState(store, { guardandoSeccion: false });
            }

            return resultado;
          } catch (err: any) {
            patchState(store, { guardandoSeccion: false });
            manejarErrorConcurrencia(err, 'Error al guardar datos personales');
            throw err;
          }
        });
      },

      ejecutarGuardado<T>(operacion: () => Promise<T>): Promise<T> {
        return ejecutarEnCola(operacion);
      },

      async enviarARevision() {
        const id = store.detalle()?.id;
        const version = store.detalle()?.versionBloqueo;
        if (!id || version === undefined) return;

        patchState(store, { enviandoRevision: true, error: null });
        try {
          const detalle = await firstValueFrom(service.enviarARevision(id, version));
          patchState(store, { detalle, enviandoRevision: false });
          return detalle;
        } catch (err: any) {
          patchState(store, { enviandoRevision: false });
          manejarErrorConcurrencia(err, 'Error al enviar a revisión');
          throw err;
        }
      },

      actualizarVersionBloqueo(version: unknown) {
        const detalle = store.detalle();
        if (!detalle || typeof version !== 'number') return;

        patchState(store, { detalle: { ...detalle, versionBloqueo: version }, errorConcurrencia: false });
      },

      async refrescarDetalleSilencioso(id: string) {
        try {
          const detalle = await firstValueFrom(service.consultarSolicitud(id));
          patchState(store, { detalle, errorConcurrencia: false });
        } catch {
          // ignore error on background refresh
        }
      },

      registrarAutoguardado(resultado: any) {
        const detalle = store.detalle();
        if (!detalle) return;

        patchState(store, {
          detalle: actualizarEstadoAutoguardado(detalle, resultado),
          errorConcurrencia: false,
        });
      },

      limpiarStore() {
        patchState(store, initialState);
      }
    };
  })
);

function actualizarEstadoAutoguardado(detalle: SolicitudDistribuidora, resultado: any): SolicitudDistribuidora {
  const completion = resultado?.completion;
  const version = resultado?.application_lock_version ?? resultado?.lock_version;
  const declarations = resultado?.section_declarations;
  const personalFields = [
    'nationality', 'first_name', 'first_last_name', 'second_last_name', 'curp',
    'curp_masked', 'rfc', 'birth_country', 'birth_date', 'birth_state',
    'birth_city', 'email', 'phone_number', 'identification_country',
    'official_id_type', 'official_id_number', 'official_id_number_masked',
    'has_identification_evidence',
  ];
  const hasPersonalData = personalFields.some((field) =>
    Object.prototype.hasOwnProperty.call(resultado ?? {}, field),
  );
  const datosPersonales = hasPersonalData
    ? { ...(detalle.datosPersonales ?? {}), ...Object.fromEntries(
      personalFields
        .filter((field) => Object.prototype.hasOwnProperty.call(resultado ?? {}, field))
        .map((field) => [field, resultado[field]]),
    ) } as SolicitudDistribuidora['datosPersonales']
    : detalle.datosPersonales;

  return {
    ...detalle,
    datosPersonales,
    versionBloqueo: typeof version === 'number' ? version : detalle.versionBloqueo,
    avance: completion ? {
      seccionesCompletadas: completion.completed_sections ?? detalle.avance.seccionesCompletadas,
      seccionesTotales: completion.total_sections ?? detalle.avance.seccionesTotales,
      puedeEnviarse: completion.can_submit ?? detalle.avance.puedeEnviarse,
    } : detalle.avance,
    declaracionesSeccion: declarations ? {
      datosPersonales: declarations.personal_data ?? declarations.datosPersonales ?? declarations.datos_personales ?? detalle.declaracionesSeccion.datosPersonales,
      domicilios: declarations.residence ?? declarations.domicilios ?? detalle.declaracionesSeccion.domicilios,
      pareja: declarations.partner ?? declarations.pareja ?? detalle.declaracionesSeccion.pareja,
      hijos: declarations.children ?? declarations.hijos ?? detalle.declaracionesSeccion.hijos,
      referenciasFamiliares: declarations.family_references ?? declarations.referenciasFamiliares ?? declarations.referencias_familiares ?? detalle.declaracionesSeccion.referenciasFamiliares,
      vehiculos: declarations.vehicles ?? declarations.vehiculos ?? detalle.declaracionesSeccion.vehiculos,
      bienes: declarations.assets ?? declarations.bienes ?? declarations.activos ?? detalle.declaracionesSeccion.bienes,
      pasivos: declarations.liabilities ?? declarations.pasivos ?? detalle.declaracionesSeccion.pasivos,
      empleos: declarations.employment ?? declarations.empleos ?? detalle.declaracionesSeccion.empleos,
      creditosComerciales: declarations.commercial_credits ?? declarations.creditosComerciales ?? declarations.creditos_comerciales ?? detalle.declaracionesSeccion.creditosComerciales,
    } : detalle.declaracionesSeccion,
  };
}
