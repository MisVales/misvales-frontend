import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reason-action-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open) {
      <div class="backdrop" role="dialog" aria-modal="true" [attr.aria-labelledby]="dialogId + '-title'" [attr.aria-describedby]="dialogId + '-help'">
        <section class="dialog">
          <h2 [id]="dialogId + '-title'">{{ title }}</h2>
          <p [id]="dialogId + '-help'">{{ message }}</p>
          <label [for]="dialogId + '-reason'">Motivo obligatorio</label>
          <textarea
            [id]="dialogId + '-reason'"
            rows="3"
            maxlength="500"
            [ngModel]="reason"
            (ngModelChange)="reasonChange.emit($event)"
            placeholder="Explique el motivo de la operación"
          ></textarea>
          <div class="actions">
            <button type="button" class="cancel" (click)="cancel.emit()" [disabled]="busy">Cancelar</button>
            <button type="button" class="confirm" [class.confirm--danger]="tone === 'danger'" (click)="confirm.emit()" [disabled]="busy || reason.trim().length === 0">
              {{ busy ? 'Procesando…' : confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; z-index: 60; inset: 0; display: grid; place-items: center; background: rgb(17 24 39 / 52%); padding: 1rem; backdrop-filter: blur(4px); }
    .dialog { width: min(100%, 30rem); border: 1px solid var(--mv-border); border-radius: var(--mv-radius-lg); background: var(--mv-surface); padding: 1.5rem; }
    h2 { margin: 0; color: var(--mv-text); font-size: 1.125rem; font-weight: 750; }
    p { margin: .625rem 0 1.25rem; color: var(--mv-text-muted); font-size: .875rem; }
    label { display: block; margin-bottom: .35rem; color: var(--mv-text); font-size: .8125rem; font-weight: 700; }
    textarea { width: 100%; resize: vertical; border: 1px solid var(--mv-border-strong); border-radius: var(--mv-radius-sm); padding: .75rem; }
    .actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1.5rem; }
    button { min-height: 2.625rem; border-radius: var(--mv-radius-sm); padding: .625rem 1rem; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .55; cursor: not-allowed; }
    .cancel { border: 1px solid var(--mv-border-strong); background: white; color: var(--mv-text); }
    .confirm { border: 1px solid var(--mv-primary-700); background: var(--mv-primary-700); color: white; }
    .confirm--danger { border-color: #b91c1c; background: #b91c1c; }
    @media (max-width: 480px) { .actions { flex-direction: column-reverse; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasonActionDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() reason = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() tone: 'default' | 'danger' = 'default';
  @Input() busy = false;
  @Input() dialogId = 'reason-action';
  @Output() readonly reasonChange = new EventEmitter<string>();
  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();
}
