import { ApplicationExperience, RoleCode, SessionStore } from '@core/session/session.store';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly experience: ApplicationExperience;
  readonly permission: string;
  readonly roles?: readonly RoleCode[];
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    label: 'Mi seguridad',
    path: '/administrativa/mi-cuenta/seguridad',
    experience: 'administrativa',
    permission: 'auth.context.read',
  },
  {
    label: 'Solicitudes de cuenta',
    path: '/administrativa/cuentas/solicitudes',
    experience: 'administrativa',
    permission: 'accounts.branch.request',
    roles: ['SUCURSAL_MANAGER'],
  },
  {
    label: 'Solicitudes de cuenta',
    path: '/administrativa/cuentas/solicitudes',
    experience: 'administrativa',
    permission: 'accounts.global.approve',
    roles: ['GENERAL_MANAGER'],
  },
  {
    label: 'Usuarios',
    path: '/administrativa/organizacion/usuarios',
    experience: 'administrativa',
    permission: 'auth.context.read',
    roles: ['ADMINISTRATOR', 'GENERAL_MANAGER', 'SUCURSAL_MANAGER'],
  },
  {
    label: 'Configuraciones',
    path: '/administrativa/configuraciones',
    experience: 'administrativa',
    permission: 'auth.context.read',
    roles: ['ADMINISTRATOR', 'GENERAL_MANAGER'],
  },
  {
    label: 'Categorías',
    path: '/administrativa/categorias',
    experience: 'administrativa',
    permission: 'auth.context.read',
    roles: ['ADMINISTRATOR', 'GENERAL_MANAGER'],
  },
  {
    label: 'Productos',
    path: '/administrativa/productos',
    experience: 'administrativa',
    permission: 'auth.context.read',
    roles: ['ADMINISTRATOR', 'GENERAL_MANAGER'],
  },
  {
    label: 'Periodos de canje',
    path: '/administrativa/periodos-canje',
    experience: 'administrativa',
    permission: 'auth.context.read',
    roles: ['ADMINISTRATOR', 'GENERAL_MANAGER'],
  },
  {
    label: 'Mi seguridad',
    path: '/tableta/mi-cuenta/seguridad',
    experience: 'tableta',
    permission: 'auth.context.read',
  },
  {
    label: 'Mi seguridad',
    path: '/distribuidora/mi-cuenta/seguridad',
    experience: 'distribuidora',
    permission: 'auth.context.read',
  },
];

export function authorizedNavigation(
  items: readonly NavigationItem[],
  session: SessionStore,
  experience: ApplicationExperience,
): readonly NavigationItem[] {
  return items.filter(
    (item) =>
      item.experience === experience &&
      session.hasPermission(item.permission) &&
      (!item.roles ||
        (session.access()?.role ? item.roles.includes(session.access()!.role!) : false)),
  );
}
