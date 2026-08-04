import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activate-account.html',
  styleUrls: ['./activate-account.css'],
})
export class ActivateAccount implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal<string | null>(null);
  
  // Estados para simular validación del token
  isValidatingToken = signal(true);
  isTokenValid = signal(false);

  activationForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  ngOnInit() {
    // Capturamos el token de la URL, e.g. /activar-cuenta?token=abc
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
        this.validateToken(params['token']);
      } else {
        // Sin token, no es válido
        this.isValidatingToken.set(false);
        this.isTokenValid.set(false);
      }
    });
  }

  private validateToken(token: string) {
    // Aquí idealmente llamas a this.authFacade.checkInvitation(token)
    // Para propósitos de este demo y que la vista renderice de inmediato:
    setTimeout(() => {
      this.isValidatingToken.set(false);
      this.isTokenValid.set(true); 
    }, 500);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.activationForm.valid && !this.isLoading && this.token()) {
      // this.authFacade.activateAccount(this.token(), this.activationForm.value.password);
      // Simulación temporal
      this.router.navigate(['/login']);
    } else {
      this.activationForm.markAllAsTouched();
    }
  }
}
