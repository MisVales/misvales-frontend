import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { TurnstileComponent } from '../../../../shared/components/inputs/turnstile/turnstile.component';
import { TurnstileService } from '../../../../core/auth/turnstile/turnstile.service';

@Component({
  selector: 'app-recover-access',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputErrorComponent, TurnstileComponent],
  templateUrl: './recover-access.html',
  styleUrls: ['./recover-access.css'],
})
export class RecoverAccess {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private turnstileService = inject(TurnstileService);

  @ViewChild(TurnstileComponent) turnstileComp?: TurnstileComponent;

  readonly turnstileToken = signal<string | null>(null);

  // Bandera para mostrar la pantalla de éxito
  isSuccess = signal(false);

  recoverForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get isTurnstileEnabled(): boolean {
    return this.turnstileService.isEnabled;
  }

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  get isSubmitDisabled(): boolean {
    if (this.isLoading || this.recoverForm.invalid) {
      return true;
    }
    if (this.isTurnstileEnabled && !this.turnstileToken()) {
      return true;
    }
    return false;
  }

  fieldError(field: string): string | null {
    return this.authFacade.validationErrors()[field]?.[0] ?? null;
  }

  onTurnstileToken(token: string | null) {
    this.turnstileToken.set(token);
  }

  onTurnstileExpired() {
    this.turnstileToken.set(null);
  }

  onTurnstileError(_error: string) {
    this.turnstileToken.set(null);
  }

  async onSubmit() {
    if (this.isSubmitDisabled) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.recoverForm.getRawValue(),
      ...(this.isTurnstileEnabled ? { turnstile_token: this.turnstileToken() } : {})
    };

    const success = await this.authFacade.recoverAccess(payload);
    if (success) {
      this.isSuccess.set(true);
    } else if (this.isTurnstileEnabled) {
      this.turnstileToken.set(null);
      this.turnstileComp?.reset();
    }
  }
}
