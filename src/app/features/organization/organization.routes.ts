import { Routes } from '@angular/router';

import { roleGuard } from '@core/guards/role.guard';

const READ_ROLES = ['ADMINISTRATOR', 'GENERAL_MANAGER', 'SUCURSAL_MANAGER'];
const WRITE_ROLES = ['GENERAL_MANAGER', 'SUCURSAL_MANAGER'];

export const ORGANIZATION_ROUTES: Routes = [
  ...listAndDetail('sucursales', 'branches', 'Sucursales', 'uuid'),
  {
    path: 'usuarios/:uuid/seguridad',
    canActivate: [roleGuard],
    data: { roles: WRITE_ROLES },
    loadComponent: () =>
      import('@features/account-security/pages/admin-user-security-page.component').then(
        (module) => module.AdminUserSecurityPageComponent,
      ),
  },
  ...listAndDetail('usuarios', 'users', 'Usuarios', 'uuid'),
  ...listAndDetail('roles', 'roles', 'Roles y permisos', 'id'),
  {
    path: 'alcances/nuevo',
    canActivate: [roleGuard],
    data: { roles: WRITE_ROLES },
    loadComponent: () =>
      import('./pages/scope-form-page.component').then((module) => module.ScopeFormPageComponent),
  },
  {
    path: 'alcances',
    canActivate: [roleGuard],
    data: { roles: READ_ROLES, resource: 'scopes', title: 'Alcances organizacionales' },
    loadComponent: () =>
      import('./pages/organization-list-page.component').then(
        (module) => module.OrganizationListPageComponent,
      ),
  },
  {
    path: 'asignaciones/nueva',
    canActivate: [roleGuard],
    data: { roles: WRITE_ROLES },
    loadComponent: () =>
      import('./pages/assignment-form-page.component').then(
        (module) => module.AssignmentFormPageComponent,
      ),
  },
  {
    path: 'asignaciones',
    canActivate: [roleGuard],
    data: { roles: READ_ROLES, resource: 'assignments', title: 'Asignaciones' },
    loadComponent: () =>
      import('./pages/organization-list-page.component').then(
        (module) => module.OrganizationListPageComponent,
      ),
  },
  {
    path: 'asignaciones/:uuid',
    canActivate: [roleGuard],
    data: { roles: READ_ROLES, resource: 'assignments' },
    loadComponent: () =>
      import('./pages/organization-detail-page.component').then(
        (module) => module.OrganizationDetailPageComponent,
      ),
  },
];

function listAndDetail(
  path: string,
  resource: 'branches' | 'roles' | 'users',
  title: string,
  parameter: 'id' | 'uuid',
): Routes {
  return [
    {
      path,
      canActivate: [roleGuard],
      data: { roles: READ_ROLES, resource, title },
      loadComponent: () =>
        import('./pages/organization-list-page.component').then(
          (module) => module.OrganizationListPageComponent,
        ),
    },
    {
      path: `${path}/:${parameter}`,
      canActivate: [roleGuard],
      data: { roles: READ_ROLES, resource },
      loadComponent: () =>
        import('./pages/organization-detail-page.component').then(
          (module) => module.OrganizationDetailPageComponent,
        ),
    },
  ];
}
