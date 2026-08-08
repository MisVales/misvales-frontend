import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);

  token = signal<string | null>(null);
  email = signal<string | null>(null);
  isSuccess = signal(false);

  // Patrón para mayúscula, minúscula, número y símbolo
  passwordPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

  resetForm: FormGroup = this.fb.group({
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      }
      if (params['email']) {
        this.email.set(params['email']);
      }
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
        password: this.resetForm.value.password,
        password_confirmation: this.resetForm.value.confirmPassword
      });
      if (success) {
        this.isSuccess.set(true);
      }
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}

