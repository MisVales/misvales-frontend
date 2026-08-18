import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputErrorComponent],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal<string | null>(null);
  email = signal<string | null>(null);
  isSuccess = signal(false);

  // Patrón para mayúscula, minúscula, número y símbolo
  passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

  resetForm = this.fb.nonNullable.group({
    password: ['', [
      Validators.required, 
      Validators.minLength(12),
      Validators.pattern(this.passwordPattern)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  fieldError(field: string): string | null {
    return this.authFacade.validationErrors()[field]?.[0] ?? null;
  }

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    this.email.set(this.route.snapshot.queryParamMap.get('email'));
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { token: null, email: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    const t = this.token();
    const e = this.email();
    if (this.resetForm.valid && !this.isLoading && t && e) {
      const success = await this.authFacade.resetPassword({
        email: e,
        token: t,
        password: this.resetForm.getRawValue().password,
        password_confirmation: this.resetForm.getRawValue().confirmPassword
      });
      if (success) {
        this.isSuccess.set(true);
      }
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}

