import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'activar-cuenta',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/pages/activate-account/activate-account').then(m => m.ActivateAccount)
      }
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'seguridad',
        loadChildren: () => import('./features/security/security.routes').then(m => m.SECURITY_ROUTES)
      },
      {
        path: 'organizacion',
        loadChildren: () => import('./features/organization/organization.routes').then(m => m.organizationRoutes)
      },
      {
        path: 'categorias',
        loadChildren: () => import('./features/categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES)
      },
      {
        path: 'productos',
        loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES)
      },
      {
        path: '**',
        loadComponent: () => import('./shared/ui/placeholder/placeholder.component').then(m => m.PlaceholderComponent)
      }
    ]
  }
];

