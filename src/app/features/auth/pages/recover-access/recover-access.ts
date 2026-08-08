import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-recover-access',
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

  async onSubmit() {
    if (this.recoverForm.valid && !this.isLoading) {
      const success = await this.authFacade.recoverAccess(this.recoverForm.value);
      if (success) {
        this.isSuccess.set(true);
      }
    } else {
      this.recoverForm.markAllAsTouched();
    }
  }
}
