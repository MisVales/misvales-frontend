import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type FeedbackPresentation = 'banner' | 'notification';
export type FeedbackKind = 'error' | 'info' | 'success' | 'warning';

@Component({
  selector: 'mv-feedback-message',
  template: `
    <section
      [class]="presentation() + ' ' + kind()"
      [attr.role]="presentation() === 'notification' ? 'status' : 'region'"
      [attr.aria-label]="presentation() === 'banner' ? 'Aviso importante' : null"
    >
      <span>{{ message() }}</span>
      @if (dismissible()) {
        <button type="button" aria-label="Cerrar notificación" (click)="dismissed.emit()">×</button>
      }
    </section>
  `,
  styles: `
    section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid var(--mv-green-medium);
      background: var(--mv-mint);
      padding: 0.8rem 1rem;
    }
    .banner {
      border-radius: 0;
    }
    .notification {
      max-width: 28rem;
      border-radius: 0.75rem;
      box-shadow: 0 12px 28px rgb(0 0 0 / 15%);
    }
    .error {
      border-color: var(--mv-danger);
      background: #fff0ee;
    }
    .warning {
      border-color: #9a6700;
      background: #fff8c5;
    }
    button {
      min-width: 44px;
      min-height: 44px;
      border: 0;
      background: transparent;
      font-size: 1.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackMessageComponent {
  readonly kind = input<FeedbackKind>('info');
  readonly presentation = input<FeedbackPresentation>('banner');
  readonly message = input.required<string>();
  readonly dismissible = input(false);
  readonly dismissed = output<void>();
}
