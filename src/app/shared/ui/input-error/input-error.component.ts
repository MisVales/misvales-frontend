import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShowErrors()) {
      <div class="mt-1 flex flex-col gap-1">
        @for (error of getErrorMessages(); track error) {
          <p class="text-xs text-red-600 animate-in fade-in slide-in-from-top-1">{{ error }}</p>
        }
      </div>
    }
  `
})
export class InputErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;
  @Input() label: string = 'Este campo';

  shouldShowErrors(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  getErrorMessages(): string[] {
    if (!this.control || !this.control.errors) return [];
    
    const errors: string[] = [];
    const errs = this.control.errors;

    if (errs['required']) {
      errors.push(`${this.label} es obligatorio.`);
    }
    if (errs['maxlength']) {
      errors.push(`${this.label} excede la longitud permitida de ${errs['maxlength'].requiredLength} caracteres.`);
    }
    if (errs['minlength']) {
      errors.push(`${this.label} debe tener al menos ${errs['minlength'].requiredLength} caracteres.`);
    }
    if (errs['pattern']) {
      errors.push(`${this.label} tiene un formato inválido.`);
    }
    if (errs['email']) {
      errors.push(`Debe ser un correo electrónico válido.`);
    }
    
    // Custom error messages
    for (const key in errs) {
       if (typeof errs[key] === 'string') {
           errors.push(errs[key]);
       }
    }

    if (errors.length === 0) {
      errors.push(`${this.label} es inválido.`);
    }

    return errors;
  }
}
