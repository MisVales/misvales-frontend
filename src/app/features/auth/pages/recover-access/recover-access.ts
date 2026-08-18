import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-recover-access',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputErrorComponent],
  templateUrl: './recover-access.html',
  styleUrls: ['./recover-access.css'],
})
export class RecoverAccess {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  // Bandera para mostrar la pantalla de éxito
  isSuccess = signal(false);

  recoverForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get isLoading() {
    return this.authFacade.isLoading();
  }

  get error() {
    return this.authFacade.error();
  }

  fieldError(field: string): string | null {
    return this.authFacade.validationErrors()[field]?.[0] ?? null;
  }

  async onSubmit() {
    if (this.recoverForm.valid && !this.isLoading) {
      const success = await this.authFacade.recoverAccess(this.recoverForm.getRawValue());
      if (success) {
        this.isSuccess.set(true);
      }
    } else {
      this.recoverForm.markAllAsTouched();
    }
  }
}
