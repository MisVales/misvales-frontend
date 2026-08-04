import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-recover-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-access.html',
  styleUrls: ['./recover-access.css'],
})
export class RecoverAccess {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  // Bandera para mostrar la pantalla de éxito
  isSuccess = signal(false);

  recoverForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  onSubmit() {
    if (this.recoverForm.valid && !this.isLoading) {
      // this.authFacade.recoverAccess(this.recoverForm.value.email);
      // Para simular el flujo en el UI:
      setTimeout(() => {
        this.isSuccess.set(true);
      }, 800);
    } else {
      this.recoverForm.markAllAsTouched();
    }
  }
}
