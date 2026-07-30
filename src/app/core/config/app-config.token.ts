import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AppEnvironment } from '../../../environments/environment.model';

export const APP_CONFIG = new InjectionToken<AppEnvironment>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
