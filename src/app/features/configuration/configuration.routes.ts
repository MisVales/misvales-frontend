import { Routes } from '@angular/router';

import { CategoriesPageComponent } from './pages/categories/categories.page';
import { CategoryVersionsPageComponent } from './pages/categories/category-versions.page';
import { ConfigurationVersionsPageComponent } from './pages/configurations/configuration-versions.page';
import { ConfigurationsPageComponent } from './pages/configurations/configurations.page';
import { ProductVersionsPageComponent } from './pages/products/product-versions.page';
import { ProductsPageComponent } from './pages/products/products.page';
import { RedemptionPeriodsPageComponent } from './pages/redemption-periods/redemption-periods.page';

export const CONFIGURATION_ROUTES: Routes = [
  {
    path: 'configuraciones',
    component: ConfigurationsPageComponent,
  },
  {
    path: 'configuraciones/:key/versiones',
    component: ConfigurationVersionsPageComponent,
  },
  {
    path: 'categorias',
    component: CategoriesPageComponent,
  },
  {
    path: 'categorias/:publicId/versiones',
    component: CategoryVersionsPageComponent,
  },
  {
    path: 'productos',
    component: ProductsPageComponent,
  },
  {
    path: 'productos/:publicId/versiones',
    component: ProductVersionsPageComponent,
  },
  {
    path: 'periodos-canje',
    component: RedemptionPeriodsPageComponent,
  },
];
