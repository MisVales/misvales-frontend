import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BrandLockupComponent } from '@shared/components/brand/brand-lockup/brand-lockup.component';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [BrandLockupComponent, LucideAngularModule, RouterLink],
  template: `
    <header class="mobile-header">
      <app-brand-lockup />
      @if (operationsCenterRoute) {
        <a
          class="header-action"
          [routerLink]="operationsCenterRoute"
          aria-label="Abrir notificaciones"
        >
          <lucide-icon name="bell" [size]="21" aria-hidden="true" />
        </a>
      }
      <details class="profile-menu" #profileMenu>
        <summary class="profile-link" aria-label="Abrir menú de perfil y seguridad"><span aria-hidden="true">{{ initials }}</span></summary>
        <div class="profile-dropdown" aria-label="Opciones de cuenta">
          <a routerLink="/seguridad" (click)="profileMenu.open = false"><lucide-icon name="shield-check" [size]="19" aria-hidden="true" /> Perfil y seguridad</a>
          <button type="button" (click)="profileMenu.open = false; logoutRequested.emit()"><lucide-icon name="log-out" [size]="19" aria-hidden="true" /> Cerrar sesión</button>
        </div>
      </details>
    </header>
  `,
  styles: `
    .mobile-header {
      z-index: 20;
      min-height: 4rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: max(0.55rem, env(safe-area-inset-top)) 0.9rem 0.55rem;
      border-bottom: 1px solid var(--mv-border);
      background: color-mix(in srgb, var(--mv-surface) 97%, transparent);
      backdrop-filter: blur(14px);
    }
    .mobile-header app-brand-lockup {
      margin-right: auto;
    }
    .header-action,
    .profile-link {
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      display: inline-grid;
      place-items: center;
      border-radius: 0.8rem;
      color: var(--mv-text);
      text-decoration: none;
    }
    .header-action {
      border: 1px solid var(--mv-border);
      background: var(--mv-surface);
    }
    .profile-link > span {
      display: grid;
      width: 2.25rem;
      height: 2.25rem;
      place-items: center;
      border-radius: 50%;
      background: var(--mv-primary-100);
      color: var(--mv-primary-700);
      font-size: 0.72rem;
      font-weight: 800;
    }
    .profile-menu { position: relative; }
    .profile-link { list-style: none; cursor: pointer; }
    .profile-link::-webkit-details-marker { display: none; }
    .profile-link:focus-visible { outline: 3px solid color-mix(in srgb, var(--mv-primary-600) 45%, transparent); outline-offset: 2px; }
    .profile-dropdown { position: absolute; z-index: 60; top: calc(100% + .55rem); right: 0; width: 13.5rem; display: grid; gap: .2rem; padding: .45rem; border: 1px solid var(--mv-border); border-radius: .95rem; background: var(--mv-surface); box-shadow: var(--mv-shadow-sheet); }
    .profile-dropdown a, .profile-dropdown button { min-height: 2.9rem; display: flex; align-items: center; gap: .65rem; padding: .55rem .7rem; border: 0; border-radius: .65rem; color: var(--mv-text); background: transparent; font: inherit; font-size: .84rem; font-weight: 700; text-align: left; text-decoration: none; }
    .profile-dropdown a:hover, .profile-dropdown button:hover { color: var(--mv-primary-700); background: var(--mv-primary-50); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileHeaderComponent {
  @Input() operationsCenterRoute: string | null = null;
  @Input() initials = '';
  @Output() readonly logoutRequested = new EventEmitter<void>();
}
