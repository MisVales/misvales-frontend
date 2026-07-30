import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';

import { ActionButtonComponent } from '@shared/components/action-button.component';

export type TechnicalDialogKind = 'confirmation' | 'information' | 'reinforced';

@Component({
  selector: 'mv-technical-dialog',
  imports: [ActionButtonComponent, CdkTrapFocus, FormsModule],
  templateUrl: './technical-dialog.component.html',
  styleUrl: './technical-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalDialogComponent {
  readonly kind = input<TechnicalDialogKind>('information');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly pending = input(false);
  readonly reinforcementPhrase = input<string | null>(null);
  readonly reinforcement = model('');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  canConfirm(): boolean {
    const phrase = this.reinforcementPhrase();
    return !this.pending() && (this.kind() !== 'reinforced' || this.reinforcement() === phrase);
  }
}
