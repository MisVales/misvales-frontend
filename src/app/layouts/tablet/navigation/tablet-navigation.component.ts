import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { EffectiveNavigationItem } from '@shared/utils/navigation/effective-navigation';

@Component({
  selector: 'app-tablet-navigation',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="tablet-bottom-nav" aria-label="Navegación principal">
      @for (item of primaryItems; track item.id) {
        <a
          class="bottom-link"
          [routerLink]="item.route"
          routerLinkActive="bottom-link--active"
          [routerLinkActiveOptions]="{ exact: item.route === '/inicio' }"
        >
          <lucide-icon [name]="item.icon" [size]="22" aria-hidden="true" />
          <span>{{ item.title }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './tablet-navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletNavigationComponent {
  @Input() primaryItems: EffectiveNavigationItem[] = [];
}
