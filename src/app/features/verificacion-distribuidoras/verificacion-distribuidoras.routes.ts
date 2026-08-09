import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

export const VERIFICACION_DISTRIBUIDORAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // ------------------------------------------
      // RUTAS DE COORDINADOR Y ADMINISTRADOR
      // ------------------------------------------
      {
        path: 'solicitudes-distribuidora/revision',
        canActivate: [permissionGuard('verification.applications.view')],
        loadComponent: () =>
          import('./pages/revision-solicitudes/revision-solicitudes.component').then(
            (m) => m.RevisionSolicitudesComponent,
          ),
      },
      {
        path: 'solicitudes-distribuidora/:id',
        canActivate: [permissionGuard('verification.applications.view')],
        loadComponent: () =>
          import('./pages/detalle-solicitud/detalle-solicitud.component').then(
            (m) => m.DetalleSolicitudComponent,
          ),
      },
      {
        path: 'solicitudes-distribuidora/:id/asignar-verificador',
        canActivate: [permissionGuard('verification.verifiers.assign')],
        loadComponent: () =>
          import('./pages/asignar-verificador/asignar-verificador.component').then(
            (m) => m.AsignarVerificadorComponent,
          ),
      },
      {
        path: 'solicitudes-distribuidora/:id/correcciones',
        canActivate: [permissionGuard('verification.corrections.manage')],
        loadComponent: () =>
          import('./pages/correcciones-solicitud/correcciones-solicitud.component').then(
            (m) => m.CorreccionesSolicitudComponent,
          ),
      },
      {
        path: 'solicitudes-distribuidora/:id/evaluacion',
        canActivate: [permissionGuard('verification.evaluations.decide')],
        loadComponent: () =>
          import('./pages/evaluacion-coordinador/evaluacion-coordinador.component').then(
            (m) => m.EvaluacionCoordinadorComponent,
          ),
      },
      {
        path: 'solicitudes-distribuidora/:id/autorizacion',
        canActivate: [permissionGuard('verification.authorizations.decide')],
        loadComponent: () =>
          import('./pages/autorizacion-gerencial/autorizacion-gerencial.component').then(
            (m) => m.AutorizacionGerencialComponent,
          ), // Reutilizamos el mismo componente que manejará la vista simple y el wizard de decisión
      },

      // ------------------------------------------
      // RUTAS DE VERIFICADOR
      // ------------------------------------------
      {
        path: 'verificaciones/asignadas',
        canActivate: [permissionGuard('verification.visits.view')],
        loadComponent: () =>
          import('./pages/visitas-asignadas/visitas-asignadas.component').then(
            (m) => m.VisitasAsignadasComponent,
          ),
      },
      {
        path: 'verificaciones/:id/visita',
        canActivate: [permissionGuard('verification.visits.perform')],
        loadComponent: () =>
          import('./pages/realizar-visita/realizar-visita.component').then(
            (m) => m.RealizarVisitaComponent,
          ),
      },

      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/inicio-verificaciones/inicio-verificaciones.component').then(
            (m) => m.InicioVerificacionesComponent,
          ),
      },
    ],
  },
];
