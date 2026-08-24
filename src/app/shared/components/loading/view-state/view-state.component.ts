import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type ViewStateKind = 'loading' | 'empty' | 'error' | 'forbidden';

@Component({
  selector: 'app-view-state',
  standalone: true,
  imports: [LucideAngularModule, NgOptimizedImage],
  template: `
    <section
      class="view-state"
      [class.view-state--compact]="compact"
      [attr.aria-live]="kind === 'loading' ? 'polite' : null"
      [attr.aria-busy]="kind === 'loading'"
      [attr.role]="kind === 'error' ? 'alert' : 'status'"
    >
      @if (kind === 'empty') {
        <img
          class="view-state__illustration"
          [ngSrc]="emptyVariant === 1 ? '/no-found-1.png' : '/no-found-2.png'"
          [width]="emptyVariant === 1 ? 1536 : 1983"
          [height]="emptyVariant === 1 ? 1024 : 793"
          alt=""
        />
      } @else {
        <span class="view-state__icon" aria-hidden="true">
          <lucide-icon [name]="iconName" [class.view-state__spinner]="kind === 'loading'"></lucide-icon>
        </span>
      }
      <div>
        <h2>{{ title }}</h2>
        @if (message) { <p>{{ message }}</p> }
      </div>
      @if (actionLabel && kind !== 'loading') {
        <button type="button" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .view-state {
      display: grid;
      justify-items: center;
      gap: .875rem;
      min-height: 17rem;
      border: 1px dashed var(--mv-border-strong);
      border-radius: var(--mv-radius-lg);
      background: var(--mv-surface-muted);
      padding: clamp(2rem, 6vw, 4rem) 1.5rem;
      text-align: center;
    }
    .view-state--compact { min-height: 0; padding: 1.5rem; }
    .view-state__icon {
      display: grid;
      width: 2.75rem;
      height: 2.75rem;
      place-items: center;
      border-radius: 50%;
      background: var(--mv-primary-100);
      color: var(--mv-primary-700);
    }
    .view-state__icon lucide-icon { width: 1.35rem; height: 1.35rem; }
    .view-state__illustration { width: min(17rem, 78%); height: 8.5rem; object-fit: contain; }
    .view-state--compact .view-state__illustration { width: min(12rem, 70%); height: 5.5rem; }
    h2 { margin: 0; color: var(--mv-text); font-size: 1rem; font-weight: 700; }
    p { max-width: 32rem; margin: .35rem 0 0; color: var(--mv-text-muted); font-size: .875rem; }
    button {
      min-height: 2.625rem;
      border: 1px solid var(--mv-primary-700);
      border-radius: var(--mv-radius-sm);
      background: var(--mv-primary-700);
      color: white;
      padding: .625rem 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    button:hover { background: var(--mv-primary-800); }
    .view-state__spinner { animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .view-state__spinner { animation-duration: 1.6s; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStateComponent {
  @Input() kind: ViewStateKind = 'empty';
  @Input({ required: true }) title = '';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() compact = false;
  @Input() emptyVariant: 1 | 2 = 1;
  @Output() readonly action = new EventEmitter<void>();

  get iconName(): string {
    switch (this.kind) {
      case 'loading': return 'loader-2';
      case 'error': return 'alert-triangle';
      case 'forbidden': return 'lock';
      case 'empty': return 'inbox';
    }
  }
}
