import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mv-summary-card',
  template: `
    <article class="card">
      <header>
        <h2>{{ title() }}</h2>
        @if (eyebrow()) {
          <span>{{ eyebrow() }}</span>
        }
      </header>
      <ng-content />
    </article>
  `,
  styles: `
    .card {
      min-width: 0;
      border: 1px solid var(--mv-gray);
      border-radius: 1rem;
      background: white;
      padding: 1rem;
      box-shadow: 0 6px 18px rgb(14 90 20 / 8%);
    }
    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }
    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
    }
    span {
      color: var(--mv-green-dark);
      font-size: 0.85rem;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input<string | null>(null);
}
