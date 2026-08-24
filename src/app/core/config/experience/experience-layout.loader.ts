import { InjectionToken, type Type } from '@angular/core';
import type { ExperienceType } from './experience.models';

export async function loadExperienceLayout(experience: ExperienceType): Promise<Type<unknown>> {
  switch (experience) {
    case 'tablet':
      return import('../../../layouts/tablet/tablet-layout').then(
        (module) => module.TabletLayoutComponent,
      );
    case 'mobile':
      return import('../../../layouts/mobile/mobile-layout').then(
        (module) => module.MobileLayoutComponent,
      );
    default:
      return import('../../../layouts/desktop/desktop-layout').then(
        (module) => module.DesktopLayoutComponent,
      );
  }
}

export const EXPERIENCE_LAYOUT_LOADER = new InjectionToken<
  (experience: ExperienceType) => Promise<Type<unknown>>
>('EXPERIENCE_LAYOUT_LOADER', {
  providedIn: 'root',
  factory: () => loadExperienceLayout,
});
