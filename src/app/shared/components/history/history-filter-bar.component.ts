import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-history-filter-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="history-filters" [attr.aria-label]="label">
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .history-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: 0.75rem;
      padding: 0.85rem;
      border: 1px solid #dfe8e2;
      border-radius: 0.85rem;
      background: #f7faf8;
    }
    @media (max-width: 640px) {
      .history-filters {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HistoryFilterBarComponent {
  @Input() label = 'Filtros del historial';
}
