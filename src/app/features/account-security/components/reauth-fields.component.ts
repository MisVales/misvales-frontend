import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'mv-reauth-fields',
  imports: [ReactiveFormsModule],
  template: `
    <fieldset class="mv-form">
      <legend>Confirmación de seguridad</legend>
      <div class="mv-field">
        <label for="reauth-password">Contraseña actual</label>
        <input
          id="reauth-password"
          type="password"
          autocomplete="current-password"
          [formControl]="password()"
        />
      </div>
      <div class="mv-field">
        <label for="reauth-totp">Código TOTP</label>
        <input
          id="reauth-totp"
          type="password"
          inputmode="numeric"
          autocomplete="one-time-code"
          [formControl]="totp()"
        />
      </div>
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReauthFieldsComponent {
  readonly password = input.required<FormControl<string>>();
  readonly totp = input.required<FormControl<string>>();
}
