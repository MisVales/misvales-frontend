import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-history-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="history-header">
      <div class="history-header__copy">
        <p class="history-header__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="history-header__description">{{ description }}</p>
      </div>
      <ng-content />
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
    .history-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #dce9e0;
    }
    .history-header__copy {
      min-width: 0;
    }
    .history-header__eyebrow {
      margin: 0;
      color: #187447;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0.25rem 0 0;
      color: #0f1d15;
      font-size: clamp(1.65rem, 2.8vw, 2rem);
      font-weight: 780;
      letter-spacing: -0.025em;
      line-height: 1.15;
    }
    .history-header__description {
      max-width: 48rem;
      margin: 0.5rem 0 0;
      color: #596b60;
      font-size: 0.92rem;
      line-height: 1.55;
    }
    @media (max-width: 640px) {
      .history-header {
        align-items: stretch;
        flex-direction: column;
      }
    }
  `,
})
export class HistoryPageHeaderComponent {
  @Input({ required: true }) eyebrow = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
