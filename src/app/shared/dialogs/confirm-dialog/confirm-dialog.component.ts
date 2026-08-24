import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="backdrop" role="dialog" aria-modal="true" [attr.aria-labelledby]="dialogId + '-title'" [attr.aria-describedby]="dialogId + '-message'">
        <section class="dialog">
          <h2 [id]="dialogId + '-title'">{{ title }}</h2>
          <p [id]="dialogId + '-message'">{{ message }}</p>
          <div class="actions">
            <button type="button" class="cancel" (click)="cancel.emit()" [disabled]="busy">Cancelar</button>
            <button type="button" class="confirm" [class.confirm--danger]="tone === 'danger'" (click)="confirm.emit()" [disabled]="busy">
              {{ busy ? 'Procesando…' : confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; z-index: 60; inset: 0; display: grid; place-items: center; background: rgb(17 24 39 / 52%); padding: 1rem; backdrop-filter: blur(4px); }
    .dialog { width: min(100%, 28rem); border: 1px solid var(--mv-border); border-radius: var(--mv-radius-lg); background: var(--mv-surface); padding: 1.5rem; }
    h2 { margin: 0; color: var(--mv-text); font-size: 1.125rem; font-weight: 750; }
    p { margin: .625rem 0 0; color: var(--mv-text-muted); font-size: .875rem; }
    .actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1.5rem; }
    button { min-height: 2.625rem; border-radius: var(--mv-radius-sm); padding: .625rem 1rem; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .6; cursor: wait; }
    .cancel { border: 1px solid var(--mv-border-strong); background: var(--mv-surface); color: var(--mv-text); }
    .confirm { border: 1px solid var(--mv-primary-700); background: var(--mv-primary-700); color: white; }
    .confirm--danger { border-color: #b91c1c; background: #b91c1c; }
    @media (max-width: 480px) { .actions { flex-direction: column-reverse; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() tone: 'default' | 'danger' = 'default';
  @Input() busy = false;
  @Input() dialogId = 'confirm-dialog';
  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();
}
