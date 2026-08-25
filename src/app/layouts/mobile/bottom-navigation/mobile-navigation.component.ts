import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { inject } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideAngularModule } from 'lucide-angular';
import type { EffectiveNavigationItem } from '@shared/utils/navigation/effective-navigation';

export interface MobileNavigationSection {
  id: 'credit' | 'vouchers' | 'home' | 'payments' | 'account';
  title: string;
  icon: string;
  route?: string;
  items?: EffectiveNavigationItem[];
  prominent?: boolean;
}

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [A11yModule, LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    @if (openSection) {
      <button type="button" class="section-scrim" aria-label="Cerrar navegación de {{ openSection.title }}" (click)="closeSection()"></button>
      <section class="section-menu" role="dialog" aria-modal="true" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" [attr.aria-labelledby]="openSection.id + '-menu-title'" (keydown.escape)="closeSection()">
        <div class="section-menu__header">
          <div><p>Sección</p><h2 [id]="openSection.id + '-menu-title'">{{ openSection.title }}</h2></div>
          <button type="button" cdkFocusInitial aria-label="Cerrar" (click)="closeSection()"><lucide-icon name="x" [size]="21" aria-hidden="true" /></button>
        </div>
        <div class="section-menu__links">
          @for (item of openSection.items; track item.id) {
            <a [routerLink]="item.route" (click)="closeSection()">
              <lucide-icon [name]="item.icon" [size]="21" aria-hidden="true" /><span>{{ item.title }}</span><lucide-icon name="chevron-right" [size]="18" aria-hidden="true" />
            </a>
          }
        </div>
      </section>
    }

    <nav class="bottom-nav" aria-label="Navegación principal">
      @for (section of sections; track section.id) {
        @if (section.items?.length) {
          <button type="button" class="bottom-nav__item" [class.bottom-nav__item--active]="openSection?.id === section.id || isSectionActive(section)" [attr.aria-current]="isSectionActive(section) ? 'page' : null" [attr.aria-expanded]="openSection?.id === section.id" aria-haspopup="dialog" (click)="toggleSection(section)">
            <lucide-icon [name]="section.icon" [size]="24" aria-hidden="true" /><span>{{ section.title }}</span>
          </button>
        } @else if (section.route) {
          <a [routerLink]="section.route" routerLinkActive="bottom-nav__item--active" [routerLinkActiveOptions]="{ exact: section.id === 'home' }" class="bottom-nav__item" [class.bottom-nav__item--home]="section.prominent" [attr.aria-label]="section.prominent ? 'Ir a Inicio, navegación principal' : null">
            <span class="bottom-nav__icon" aria-hidden="true"><lucide-icon [name]="section.icon" [size]="section.prominent ? 29 : 24" /></span><span>{{ section.title }}</span>
          </a>
        } @else {
          <button type="button" class="bottom-nav__item" disabled><lucide-icon [name]="section.icon" [size]="24" aria-hidden="true" /><span>{{ section.title }}</span></button>
        }
      }
    </nav>
  `,
  styleUrl: './mobile-navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavigationComponent {
  private readonly router = inject(Router);
  @Input() sections: MobileNavigationSection[] = [];
  @Output() readonly sectionOpenChange = new EventEmitter<boolean>();
  openSection: MobileNavigationSection | null = null;

  toggleSection(section: MobileNavigationSection): void {
    this.openSection = this.openSection?.id === section.id ? null : section;
    this.sectionOpenChange.emit(this.openSection !== null);
  }
  closeSection(): void { this.openSection = null; this.sectionOpenChange.emit(false); }

  isSectionActive(section: MobileNavigationSection): boolean {
    return section.items?.some((item) => !!item.route && this.router.url.startsWith(item.route)) ?? false;
  }
}
