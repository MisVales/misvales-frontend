import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header" [attr.aria-labelledby]="headingId">
      <div class="page-header__copy">
        @if (eyebrow) {
          <p class="page-header__eyebrow">{{ eyebrow }}</p>
        }
        <h1 class="page-header__title" [id]="headingId">{{ title }}</h1>
        @if (description) {
          <p class="page-header__description">{{ description }}</p>
        }
        <ng-content select="[pageHeaderMeta]"></ng-content>
      </div>
      <div class="page-header__actions">
        <ng-content select="[pageHeaderActions]"></ng-content>
      </div>
    </header>
  `,
  styles: `
    :host { display: block; }
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      border-bottom: 1px solid var(--mv-border);
      padding-bottom: 1.25rem;
    }
    .page-header__copy { min-width: 0; }
    .page-header__eyebrow {
      margin: 0 0 .25rem;
      color: var(--mv-primary-600);
      font-size: .8125rem;
      font-weight: 700;
      letter-spacing: .035em;
    }
    .page-header__title {
      margin: 0;
      color: var(--mv-text);
      font-size: clamp(1.5rem, 2.4vw, 2rem);
      font-weight: 720;
      letter-spacing: -.025em;
      line-height: 1.2;
    }
    .page-header__description {
      max-width: 48rem;
      margin: .45rem 0 0;
      color: var(--mv-text-muted);
      font-size: .925rem;
    }
    .page-header__actions {
      display: flex;
      flex: 0 0 auto;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: .625rem;
    }
    .page-header__actions:empty { display: none; }
    @media (max-width: 640px) {
      .page-header { flex-direction: column; gap: 1rem; }
      .page-header__actions { width: 100%; justify-content: stretch; }
      .page-header__actions ::ng-deep > * { flex: 1 1 auto; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
  @Input() description = '';
  @Input() headingId = 'page-title';
}
