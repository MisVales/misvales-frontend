import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';
import { roleGuard } from '@core/guards/role.guard';

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
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['general_manager', 'branch_manager', 'coordinator', 'admin'])],
        loadComponent: () => import('./pages/revision-solicitudes/revision-solicitudes.component').then(m => m.RevisionSolicitudesComponent)
      },
      {
        path: 'solicitudes-distribuidora/autorizaciones',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['general_manager', 'branch_manager'])],
        loadComponent: () => import('./pages/autorizacion-gerencial/autorizacion-gerencial.component').then(m => m.AutorizacionGerencialComponent)
      },
      {
        path: 'solicitudes-distribuidora/:id',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['general_manager', 'branch_manager', 'coordinator', 'admin'])],
        loadComponent: () => import('./pages/detalle-solicitud/detalle-solicitud.component').then(m => m.DetalleSolicitudComponent)
      },
      {
        path: 'solicitudes-distribuidora/:id/asignar-verificador',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['coordinator'])],
        loadComponent: () => import('./pages/asignar-verificador/asignar-verificador.component').then(m => m.AsignarVerificadorComponent)
      },
      {
        path: 'solicitudes-distribuidora/:id/correcciones',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['coordinator'])],
        loadComponent: () => import('./pages/correcciones-solicitud/correcciones-solicitud.component').then(m => m.CorreccionesSolicitudComponent)
      },
      {
        path: 'solicitudes-distribuidora/:id/evaluacion',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['coordinator'])],
        loadComponent: () => import('./pages/evaluacion-coordinador/evaluacion-coordinador.component').then(m => m.EvaluacionCoordinadorComponent)
      },
      {
        path: 'solicitudes-distribuidora/:id/autorizacion',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['general_manager', 'branch_manager'])],
        loadComponent: () => import('./pages/autorizacion-gerencial/autorizacion-gerencial.component').then(m => m.AutorizacionGerencialComponent) // Reutilizamos el mismo componente que manejará la vista simple y el wizard de decisión
      },

      // ------------------------------------------
      // RUTAS DE VERIFICADOR
      // ------------------------------------------
      {
        path: 'verificaciones/asignadas',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['verifier'])],
        loadComponent: () => import('./pages/visitas-asignadas/visitas-asignadas.component').then(m => m.VisitasAsignadasComponent)
      },
      {
        path: 'verificaciones/:id/visita',
        canActivate: [permissionGuard('distributor_applications.view'), roleGuard(['verifier'])],
        loadComponent: () => import('./pages/realizar-visita/realizar-visita.component').then(m => m.RealizarVisitaComponent)
      },
      
      { path: '', redirectTo: 'solicitudes-distribuidora/revision', pathMatch: 'full' }
    ]
  }
];
