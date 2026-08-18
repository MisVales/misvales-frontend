import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { TurnstileComponent } from '../../../../shared/ui/turnstile/turnstile.component';
import { TurnstileService } from '../../../../core/turnstile/turnstile.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputErrorComponent, TurnstileComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private turnstileService = inject(TurnstileService);

  @ViewChild(TurnstileComponent) turnstileComp?: TurnstileComponent;

  readonly turnstileToken = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
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
    if (this.isLoading || this.loginForm.invalid) {
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
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.loginForm.getRawValue(),
      ...(this.isTurnstileEnabled ? { turnstile_token: this.turnstileToken() } : {})
    };

    await this.authFacade.login(payload);

    // If login resulted in an error, reset Turnstile token/widget for a new challenge
    if (this.error && this.isTurnstileEnabled) {
      this.turnstileToken.set(null);
      this.turnstileComp?.reset();
    }
  }
}
