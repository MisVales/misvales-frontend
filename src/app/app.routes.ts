import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { experienceChildGuard, experienceGuard } from './core/guards/experience.guard';
import { environment } from '../environments/environment';
import { roleGuard } from './core/guards/role.guard';

const componentCatalogRoutes: Routes = environment.production
  ? []
  : [
      {
        path: 'compos',
        title: 'Catálogo de componentes · MisVales',
        canActivate: [authGuard, roleGuard(['general_manager', 'admin'])],
        loadComponent: () =>
          import('./features/compos/compos-catalog.component').then(
            (component) => component.ComposCatalogComponent,
          ),
      },
    ];

export const routes: Routes = [
  ...componentCatalogRoutes,
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'configurar-mfa', redirectTo: 'auth/totp', pathMatch: 'full' },
  { path: 'confirmar-recuperacion', redirectTo: 'activar-cuenta', pathMatch: 'full' },
  { path: 'recuperar-acceso', redirectTo: 'auth/recuperar-acceso', pathMatch: 'full' },
  { path: 'restablecer-contrasena', redirectTo: 'auth/restablecer-contrasena', pathMatch: 'full' },
  {
    path: 'activar-cuenta',
    loadComponent: () => import('./layouts/auth/auth-layout').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        canDeactivate: [
          (component: { canLeave(): boolean | Promise<boolean> }) => component.canLeave(),
        ],
        loadComponent: () =>
          import('./core/auth/pages/activate-account/activate-account').then(
            (m) => m.ActivateAccount,
          ),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth/auth-layout').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./core/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dispositivo-no-compatible',
        loadComponent: () =>
          import('./features/experience/pages/device-unsupported/device-unsupported.component').then(
            (m) => m.DeviceUnsupportedComponent,
          ),
      },
      {
        path: 'acceso-denegado',
        data: { statusPage: 'forbidden' },
        loadComponent: () =>
          import('./shared/components/status/http-status-page/http-status-page.component').then(
            (m) => m.HttpStatusPageComponent,
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./core/config/experience/experience-layout-host.component').then(
            (m) => m.ExperienceLayoutHostComponent,
          ),
        canActivate: [experienceGuard],
        canActivateChild: [experienceChildGuard],
        children: [
          {
            path: '',
            loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
          },
          {
            path: 'perfil',
            loadComponent: () =>
              import('./features/profile/pages/profile/profile').then((m) => m.Profile),
          },
          {
            path: 'coordinacion/:view',
            canActivate: [roleGuard(['coordinator'])],
            loadComponent: () =>
              import('./features/coordinator/coordinator-workspace-page.component').then(
                (m) => m.CoordinatorWorkspacePageComponent,
              ),
          },
          {
            path: 'seguridad',
            loadChildren: () =>
              import('./features/security/security.routes').then((m) => m.SECURITY_ROUTES),
          },
          {
            path: 'organizacion',
            loadChildren: () =>
              import('./features/organization/organization.routes').then(
                (m) => m.organizationRoutes,
              ),
          },
          {
            path: 'categorias',
            canActivate: [roleGuard(['general_manager', 'admin'])],
            loadChildren: () =>
              import('./features/categories/categorias.routes').then((m) => m.CATEGORIAS_ROUTES),
          },
          {
            path: 'productos',
            canActivate: [roleGuard(['general_manager', 'admin'])],
            loadChildren: () =>
              import('./features/products/productos.routes').then((m) => m.PRODUCTOS_ROUTES),
          },
          {
            path: 'configuraciones',
            canActivate: [roleGuard(['general_manager', 'admin'])],
            loadChildren: () =>
              import('./features/settings/configuraciones.routes').then(
                (m) => m.CONFIGURACIONES_ROUTES,
              ),
          },
          {
            path: 'verificacion-distribuidoras',
            loadChildren: () =>
              import('./features/verifications/verificacion-distribuidoras.routes').then(
                (m) => m.VERIFICACION_DISTRIBUIDORAS_ROUTES,
              ),
          },
          {
            path: 'solicitudes-distribuidoras',
            loadChildren: () =>
              import('./features/applications/applications.routes').then(
                (m) => m.applicationsRoutes,
              ),
          },
          {
            path: 'distribuidoras',
            loadChildren: () =>
              import('./features/distributors/distribuidoras.routes').then(
                (m) => m.distribuidorasRoutes,
              ),
          },
          {
            path: 'clientes',
            loadChildren: () =>
              import('./features/clients/clientes.routes').then((m) => m.CLIENTES_ROUTES),
          },
          {
            path: 'vales',
            loadChildren: () =>
              import('./features/vouchers/vales.routes').then((m) => m.valesRoutes),
          },
          {
            path: 'relaciones-pagos',
            loadChildren: () =>
              import('./features/relations/relations-payments.routes').then(
                (m) => m.relacionesPagosRoutes,
              ),
          },
          {
            path: 'riesgo',
            loadChildren: () =>
              import('./features/delinquency/riesgo.routes').then((m) => m.riesgoRoutes),
          },
          {
            path: 'transferencias',
            loadChildren: () =>
              import('./features/mobility/transferencias.routes').then(
                (m) => m.transferenciasRoutes,
              ),
          },
          {
            path: 'centro-operacion',
            loadChildren: () =>
              import('./features/notifications/centro-operacion.routes').then(
                (m) => m.centroOperacionRoutes,
              ),
          },
          {
            path: 'auditoria',
            loadChildren: () =>
              import('./features/audit/auditoria.routes').then((m) => m.AUDITORIA_ROUTES),
          },
          {
            path: 'puntos',
            loadChildren: () =>
              import('./features/points/puntos.routes').then((m) => m.PUNTOS_ROUTES),
          },
          { path: '**', redirectTo: '/inicio' },
        ],
      },
    ],
  },
];
