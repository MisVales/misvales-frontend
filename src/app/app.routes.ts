import { Routes } from '@angular/router';

import { experienceGuard } from '@core/guards/experience.guard';
import { publicOnlyGuard } from '@core/guards/public-only.guard';
import { rootGuard } from '@core/guards/root.guard';
import { sessionGuard } from '@core/guards/session.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootGuard],
    loadComponent: () =>
      import('@shared/components/route-placeholder.component').then(
        (module) => module.RoutePlaceholderComponent,
      ),
  },
  {
    path: 'acceso',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('@layouts/auth/auth-layout.component').then((module) => module.AuthLayoutComponent),
    loadChildren: () => import('@features/auth/auth.routes').then((module) => module.AUTH_ROUTES),
  },
  {
    path: 'administrativa',
    canActivate: [sessionGuard, experienceGuard],
    data: { experience: 'administrativa' },
    loadComponent: () =>
      import('@layouts/desktop/desktop-layout.component').then(
        (module) => module.DesktopLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@shared/components/experience-home-page.component').then(
            (module) => module.ExperienceHomePageComponent,
          ),
      },
      {
        path: 'mi-cuenta',
        loadChildren: () =>
          import('@features/account-security/account-security.routes').then(
            (module) => module.ACCOUNT_SECURITY_ROUTES,
          ),
      },
      {
        path: 'cuentas',
        loadChildren: () =>
          import('@features/account-security/account-security.routes').then(
            (module) => module.ACCOUNT_ADMIN_ROUTES,
          ),
      },
      {
        path: 'organizacion',
        loadChildren: () =>
          import('@features/organization/organization.routes').then(
            (module) => module.ORGANIZATION_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('@features/configuration/configuration.routes').then(
            (module) => module.CONFIGURATION_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'tableta',
    canActivate: [sessionGuard, experienceGuard],
    data: { experience: 'tableta' },
    loadComponent: () =>
      import('@layouts/tablet/tablet-layout.component').then(
        (module) => module.TabletLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@shared/components/experience-home-page.component').then(
            (module) => module.ExperienceHomePageComponent,
          ),
      },
      {
        path: 'mi-cuenta',
        loadChildren: () =>
          import('@features/account-security/account-security.routes').then(
            (module) => module.ACCOUNT_SECURITY_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'distribuidora',
    canActivate: [sessionGuard, experienceGuard],
    data: { experience: 'distribuidora' },
    loadComponent: () =>
      import('@layouts/mobile/mobile-layout.component').then(
        (module) => module.MobileLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@shared/components/experience-home-page.component').then(
            (module) => module.ExperienceHomePageComponent,
          ),
      },
      {
        path: 'mi-cuenta',
        loadChildren: () =>
          import('@features/account-security/account-security.routes').then(
            (module) => module.ACCOUNT_SECURITY_ROUTES,
          ),
      },
    ],
  },
  {
    path: '403',
    data: {
      kind: 'denied',
      message: 'Tu sesión no tiene autorización para esta ruta.',
    },
    loadComponent: () =>
      import('@shared/components/technical-state-page.component').then(
        (module) => module.TechnicalStatePageComponent,
      ),
  },
  {
    path: '404',
    data: {
      kind: 'not-found',
      message: 'La ruta solicitada no existe.',
    },
    loadComponent: () =>
      import('@shared/components/technical-state-page.component').then(
        (module) => module.TechnicalStatePageComponent,
      ),
  },
  {
    path: 'sin-conexion',
    data: {
      kind: 'offline',
      message: 'No fue posible confirmar la operación. Revisa tu conexión.',
    },
    loadComponent: () =>
      import('@shared/components/technical-state-page.component').then(
        (module) => module.TechnicalStatePageComponent,
      ),
  },
  {
    path: 'error',
    data: {
      kind: 'fatal',
      message: 'Ocurrió un error técnico controlado.',
    },
    loadComponent: () =>
      import('@shared/components/technical-state-page.component').then(
        (module) => module.TechnicalStatePageComponent,
      ),
  },
  {
    path: '**',
    data: {
      kind: 'not-found',
      message: 'La ruta solicitada no existe.',
    },
    loadComponent: () =>
      import('@shared/components/technical-state-page.component').then(
        (module) => module.TechnicalStatePageComponent,
      ),
  },
];
