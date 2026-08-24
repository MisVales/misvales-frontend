import { Component, inject, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import * as QRCode from 'qrcode';
import { ConfirmDialogComponent } from '../../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputErrorComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './activate-account.html',
  styleUrls: ['./activate-account.css'],
})
export class ActivateAccount implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  fieldError(field: string): string | null {
    return this.authFacade.validationErrors()[field]?.[0] ?? null;
  }

  activationForm: FormGroup = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.pattern(/(?=.*[a-z])/),
          Validators.pattern(/(?=.*[A-Z])/),
          Validators.pattern(/(?=.*\d)/),
          Validators.pattern(/(?=.*[@$!%*?&_\-#.+])/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      totpCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    },
    { validators: this.passwordMatchValidator },
  );

  completionForm: FormGroup = this.fb.group({
    safeguarded: [false, Validators.requiredTrue],
  });

  isLoading = this.authFacade.isLoading;
  error = this.authFacade.error;
  phase = this.authFacade.activationPhase;
  user = this.authFacade.activationUser;
  qrCodeUrl = this.authFacade.activationQrCode;
  totpSecret = this.authFacade.activationTotpSecret;
  activationMfaBypass = this.authFacade.activationMfaBypass;
  recoveryCodes = this.authFacade.activationRecoveryCodes;

  generatedQrCodeUrl = signal<string | null>(null);
  copiedCodes = signal<boolean>(false);
  leaveDialogOpen = signal(false);
  private leaveResolver?: (allow: boolean) => void;

  constructor() {
    effect(() => {
      const qr = this.qrCodeUrl();
      if (!qr) {
        this.generatedQrCodeUrl.set(null);
        return;
      }

      if (qr.startsWith('otpauth://')) {
        QRCode.toDataURL(qr, { margin: 1, width: 256 })
          .then((url) => this.generatedQrCodeUrl.set(url))
          .catch(() => this.generatedQrCodeUrl.set(null));
      }
    });

    effect(() => {
      const totpControl = this.activationForm.get('totpCode');
      if (!totpControl) return;

      if (this.activationMfaBypass()) {
        totpControl.clearValidators();
        totpControl.setValue('', { emitEvent: false });
      } else {
        totpControl.setValidators([Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
      }

      totpControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  get passwordCriteria() {
    const pw = this.activationForm.get('password')?.value || '';
    return {
      length: pw.length >= 12,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /\d/.test(pw),
      symbol: /[@$!%*?&_\-#.+]/.test(pw),
    };
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { token: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      this.authFacade.inspectInvitation(token);
    } else {
      this.authFacade.inspectInvitation('');
    }
  }

  ngOnDestroy(): void {
    this.authFacade.resetState();
  }

  canLeave(): boolean | Promise<boolean> {
    if (this.phase() !== 2) return true;
    this.leaveDialogOpen.set(true);
    return new Promise<boolean>((resolve) => {
      this.leaveResolver = resolve;
    });
  }

  resolveLeave(allow: boolean): void {
    this.leaveDialogOpen.set(false);
    this.leaveResolver?.(allow);
    this.leaveResolver = undefined;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  onSetupSubmit() {
    if (this.activationForm.valid && !this.isLoading()) {
      this.authFacade.setupInvitation({
        password: this.activationForm.value.password,
        password_confirmation: this.activationForm.value.confirmPassword,
        totp_code: this.activationMfaBypass() ? undefined : this.activationForm.value.totpCode,
      });
    } else {
      this.activationForm.markAllAsTouched();
    }
  }

  onCompleteSubmit() {
    if (this.completionForm.valid && !this.isLoading()) {
      this.authFacade.proceedToPasskeys();
    } else {
      this.completionForm.markAllAsTouched();
    }
  }

  registerPasskey() {
    this.authFacade.registerPasskey();
  }

  skipPasskey() {
    this.authFacade.skipPasskey();
  }

  goToLogin() {
    this.authFacade.resetState();
    this.router.navigate(['/auth/login']);
  }

  resendInvitation() {
    this.authFacade.resendInvitation();
  }

  copyCodes() {
    const codes = this.recoveryCodes();
    if (codes && codes.length > 0) {
      const textToCopy = codes.join('\n');
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.copiedCodes.set(true);
          setTimeout(() => this.copiedCodes.set(false), 2000);
        })
        .catch(() => this.copiedCodes.set(false));
    }
  }

  downloadCodes() {
    const codes = this.recoveryCodes();
    if (codes && codes.length > 0) {
      const text = codes.join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codigos_de_rescate.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}
