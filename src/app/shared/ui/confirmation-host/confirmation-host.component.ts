import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-host',
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    @if (confirmation.request(); as request) {
      <app-confirm-dialog
        [open]="true"
        [title]="request.title"
        [message]="request.message"
        [confirmLabel]="request.confirmLabel || 'Confirmar'"
        [tone]="request.tone || 'default'"
        dialogId="global-confirmation"
        (confirm)="confirmation.resolve(true)"
        (cancel)="confirmation.resolve(false)"
      ></app-confirm-dialog>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationHostComponent {
  readonly confirmation = inject(ConfirmationService);
}
