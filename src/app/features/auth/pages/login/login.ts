import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  mfaForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{6,8}$/)]]
  });

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  get requiresMfa() {
    return this.authFacade.requiresMfa();
  }
  onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.authFacade.login(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }



  onMfaSubmit() {
    if (this.mfaForm.valid && !this.isLoading) {
      // Tomamos el email del primer form o usamos el mecanismo del backend
      // (Algunos backends asocian el MFA challenge a una cookie temporal, asumimos eso aquí)
      this.authFacade.verifyMfa({ totpCode: this.mfaForm.value.code });
    } else {
      this.mfaForm.markAllAsTouched();
    }
  }

  cancelMfa() {
    this.authFacade.resetState();
    this.mfaForm.reset();
    this.loginForm.reset();
  }
}
