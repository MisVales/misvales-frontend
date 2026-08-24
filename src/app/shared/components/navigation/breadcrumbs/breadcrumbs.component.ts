import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items.length > 0) {
      <nav class="breadcrumbs" aria-label="Migas de pan">
        <ol>
          @for (item of items; track item.label; let last = $last) {
            <li>
              @if (item.url && !last) {
                <a [routerLink]="item.url">{{ item.label }}</a>
              } @else {
                <span [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
              }
              @if (!last) { <span class="separator" aria-hidden="true">/</span> }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: `
    :host { display: block; }
    .breadcrumbs { margin-bottom: .75rem; color: var(--mv-text-muted); font-size: .8125rem; }
    ol { display: flex; flex-wrap: wrap; gap: .375rem; margin: 0; padding: 0; list-style: none; }
    li { display: inline-flex; align-items: center; gap: .375rem; }
    a { color: var(--mv-primary-700); font-weight: 650; text-decoration: none; }
    a:hover { text-decoration: underline; text-underline-offset: 3px; }
    [aria-current='page'] { color: var(--mv-text); }
    .separator { color: var(--mv-border-strong); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  @Input() items: readonly BreadcrumbItem[] = [];
}
