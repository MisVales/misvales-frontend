import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { experienceChildGuard, experienceGuard } from './core/guards/experience.guard';
import { ExperienceLayoutComponent } from './layouts/experience-layout/experience-layout.component';

export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'configurar-mfa', redirectTo: 'auth/totp', pathMatch: 'full' },
  { path: 'confirmar-recuperacion', redirectTo: 'activar-cuenta', pathMatch: 'full' },
  { path: 'recuperar-acceso', redirectTo: 'auth/recuperar-acceso', pathMatch: 'full' },
  { path: 'restablecer-contrasena', redirectTo: 'auth/restablecer-contrasena', pathMatch: 'full' },
  {
    path: 'activar-cuenta',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        canDeactivate: [(component: { canLeave(): boolean | Promise<boolean> }) => component.canLeave()],
        loadComponent: () =>
          import('./features/auth/pages/activate-account/activate-account').then(
            (m) => m.ActivateAccount,
          ),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dispositivo-no-compatible',
        loadComponent: () => import('./features/experience/pages/device-unsupported/device-unsupported.component').then((m) => m.DeviceUnsupportedComponent),
      },
      {
        path: 'acceso-denegado',
        data: { statusPage: 'forbidden' },
        loadComponent: () =>
          import('./shared/ui/http-status-page/http-status-page.component').then(
            (m) => m.HttpStatusPageComponent,
          ),
      },
      {
        path: '',
        component: ExperienceLayoutComponent,
        canActivate: [experienceGuard],
        canActivateChild: [experienceChildGuard],
        children: [
          { path: '', loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
          { path: 'perfil', loadComponent: () => import('./features/profile/pages/profile/profile').then((m) => m.Profile) },
          { path: 'seguridad', loadChildren: () => import('./features/security/security.routes').then((m) => m.SECURITY_ROUTES) },
          { path: 'organizacion', loadChildren: () => import('./features/organization/organization.routes').then((m) => m.organizationRoutes) },
          { path: 'categorias', loadChildren: () => import('./features/categorias/categorias.routes').then((m) => m.CATEGORIAS_ROUTES) },
          { path: 'productos', loadChildren: () => import('./features/productos/productos.routes').then((m) => m.PRODUCTOS_ROUTES) },
          { path: 'configuraciones', loadChildren: () => import('./features/configuraciones/configuraciones.routes').then((m) => m.CONFIGURACIONES_ROUTES) },
          { path: 'verificacion-distribuidoras', loadChildren: () => import('./features/verificacion-distribuidoras/verificacion-distribuidoras.routes').then((m) => m.VERIFICACION_DISTRIBUIDORAS_ROUTES) },
          { path: 'solicitudes-distribuidoras', loadChildren: () => import('./features/applications/applications.routes').then((m) => m.applicationsRoutes) },
          { path: 'distribuidoras', loadChildren: () => import('./features/distribuidoras/distribuidoras.routes').then((m) => m.distribuidorasRoutes) },
          { path: 'clientes', loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES) },
          { path: 'vales', loadChildren: () => import('./features/vales/vales.routes').then((m) => m.valesRoutes) },
          { path: 'relaciones-pagos', loadChildren: () => import('./features/relaciones-pagos/relaciones-pagos.routes').then((m) => m.relacionesPagosRoutes) },
          { path: 'riesgo', loadChildren: () => import('./features/riesgo/riesgo.routes').then((m) => m.riesgoRoutes) },
          { path: 'transferencias', loadChildren: () => import('./features/transferencias/transferencias.routes').then((m) => m.transferenciasRoutes) },
          { path: 'centro-operacion', loadChildren: () => import('./features/centro-operacion/centro-operacion.routes').then((m) => m.centroOperacionRoutes) },
          { path: '**', redirectTo: '/inicio' },
        ],
      },
    ],
  },
];
