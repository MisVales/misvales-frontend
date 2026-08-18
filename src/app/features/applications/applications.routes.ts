import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { negativeRoleGuard } from '../../core/guards/negative-role.guard';
import { ListadoSolicitudesPageComponent } from './pages/listado/listado-solicitudes-page.component';
import { CrearSolicitudPageComponent } from './pages/crear/crear-solicitud-page.component';
import { DetalleSolicitudPageComponent } from './pages/detalle/detalle-solicitud-page.component';

export const applicationsRoutes: Routes = [
  {
    path: '',
    component: ListadoSolicitudesPageComponent,
    canActivate: [permissionGuard('distributor_applications.view')]
  },
  {
    path: 'nueva',
    component: CrearSolicitudPageComponent,
    canActivate: [negativeRoleGuard(['cashier', 'distributor']), permissionGuard('distributor_applications.create')]
  },
  {
    path: ':application_id',
    component: DetalleSolicitudPageComponent,
    canActivate: [permissionGuard('distributor_applications.view')]
  }
];

