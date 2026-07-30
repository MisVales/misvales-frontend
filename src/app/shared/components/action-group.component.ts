import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mv-action-group',
  template: `
    <div class="actions" [attr.aria-label]="label()">
      <ng-content />
    </div>
  `,
  styles: `
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionGroupComponent {
  readonly label = input('Acciones disponibles');
}
