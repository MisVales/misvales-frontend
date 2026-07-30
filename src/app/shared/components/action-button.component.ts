import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type ActionButtonVariant = 'destructive' | 'icon' | 'primary' | 'secondary';

@Component({
  selector: 'mv-action-button',
  imports: [MatButtonModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  readonly variant = input<ActionButtonVariant>('primary');
  readonly disabled = input(false);
  readonly pending = input(false);
  readonly accessibleLabel = input<string | null>(null);
  readonly activated = output<void>();
}
