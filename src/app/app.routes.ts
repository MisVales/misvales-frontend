import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
      }
    ]
  },
  {
    path: 'organizacion',
    loadChildren: () => import('./features/organization/organization.routes').then(m => m.organizationRoutes)
  }
];
