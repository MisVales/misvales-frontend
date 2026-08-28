import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { TurnstileComponent } from '../../../../shared/components/inputs/turnstile/turnstile.component';
import { TurnstileService } from '../../../../core/auth/turnstile/turnstile.service';
import { LucideAngularModule } from 'lucide-angular';
import { BrandLockupComponent } from '../../../../shared/components/brand/brand-lockup/brand-lockup.component';
import { AuthService, type LocalSwitchAccount } from '../../data-access/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    BrandLockupComponent,
    CommonModule,
    InputErrorComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterLink,
    TurnstileComponent,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private turnstileService = inject(TurnstileService);
  private authService = inject(AuthService);

  @ViewChild(TurnstileComponent) turnstileComp?: TurnstileComponent;

  readonly turnstileToken = signal<string | null>(null);
  readonly passwordVisible = signal(false);
  readonly localAccountSwitchEnabled = !environment.production;
  readonly localAccountsLoading = signal(false);
  readonly localAccountsError = signal('');
  readonly localAccounts = signal<LocalSwitchAccount[]>([]);
  readonly localDistributors = signal<LocalSwitchAccount[]>([]);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    if (this.localAccountSwitchEnabled) {
      this.localAccountsLoading.set(true);
      this.authService.localAccounts().subscribe({
        next: (data) => {
          this.localAccounts.set(data.accounts);
          this.localDistributors.set(data.distributors);
          this.localAccountsLoading.set(false);
        },
        error: () => {
          this.localAccountsError.set('No fue posible cargar las cuentas locales.');
          this.localAccountsLoading.set(false);
        },
      });
    }
  }

  async selectLocalAccount(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;
    select.value = '';
    if (!userId || this.isLoading) return;
    await this.authFacade.switchLocalAccount(userId);
  }

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
