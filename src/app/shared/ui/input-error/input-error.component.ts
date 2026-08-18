import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShowErrors()) {
      <div class="mt-1 flex flex-col gap-0.5">
        @for (error of getErrorMessages(); track error) {
          <p class="text-xs text-red-600 animate-in fade-in slide-in-from-top-1 font-normal flex items-start gap-1">
            <span class="inline-block leading-none mt-0.5">•</span>
            <span>{{ error }}</span>
          </p>
        }
      </div>
    }
  `
})
export class InputErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label: string = 'Este campo';
  @Input() customMessages?: Record<string, string>;
  @Input() serverError?: string | string[] | null;
  @Input() forceShow: boolean = false;

  shouldShowErrors(): boolean {
    if (this.serverError) {
      if (Array.isArray(this.serverError) && this.serverError.length > 0) return true;
      if (typeof this.serverError === 'string' && this.serverError.trim().length > 0) return true;
    }
    if (this.forceShow) return true;
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  getErrorMessages(): string[] {
    const errors: string[] = [];

    // Server-side errors for this input
    if (this.serverError) {
      if (Array.isArray(this.serverError)) {
        errors.push(...this.serverError.filter(Boolean));
      } else if (typeof this.serverError === 'string' && this.serverError.trim().length > 0) {
        errors.push(this.serverError);
      }
    }

    if (!this.control || !this.control.errors) {
      return errors;
    }

    const errs = this.control.errors;
    const custom = this.customMessages || {};

    if (errs['required']) {
      errors.push(custom['required'] ?? `${this.label} es obligatorio.`);
    }

    if (errs['minlength']) {
      const min = errs['minlength'].requiredLength;
      errors.push(custom['minlength'] ?? `${this.label} debe tener al menos ${min} caracteres.`);
    }

    if (errs['maxlength']) {
      const max = errs['maxlength'].requiredLength;
      errors.push(custom['maxlength'] ?? `${this.label} no debe exceder ${max} caracteres.`);
    }

    if (errs['email']) {
      errors.push(custom['email'] ?? `Debe ingresar un correo electrónico válido.`);
    }

    if (errs['min']) {
      const minVal = errs['min'].min;
      errors.push(custom['min'] ?? `${this.label} debe ser mayor o igual a ${minVal}.`);
    }

    if (errs['max']) {
      const maxVal = errs['max'].max;
      errors.push(custom['max'] ?? `${this.label} debe ser menor o igual a ${maxVal}.`);
    }

    if (errs['pattern']) {
      errors.push(custom['pattern'] ?? `${this.label} tiene un formato inválido.`);
    }

    // Project-specific custom domain validators
    if (errs['invalidCurp'] || errs['curpInvalido'] || errs['curp']) {
      errors.push(custom['curp'] ?? custom['invalidCurp'] ?? `El formato del CURP es inválido (18 caracteres oficiales).`);
    }

    if (errs['invalidRfc'] || errs['rfcInvalido'] || errs['rfc']) {
      errors.push(custom['rfc'] ?? custom['invalidRfc'] ?? `El formato del RFC es inválido (10 a 13 caracteres).`);
    }

    if (errs['invalidPhone'] || errs['telefonoInvalido'] || errs['phone']) {
      errors.push(custom['phone'] ?? custom['invalidPhone'] ?? `Debe ser un número telefónico válido de 10 dígitos.`);
    }

    if (errs['invalidClabe'] || errs['clabeInvalida'] || errs['clabe']) {
      errors.push(custom['clabe'] ?? custom['invalidClabe'] ?? `La CLABE interbancaria debe tener exactamente 18 dígitos.`);
    }

    if (errs['passwordsMismatch'] || errs['passwordMismatch']) {
      errors.push(custom['passwordsMismatch'] ?? `Las contraseñas no coinciden.`);
    }

    if (errs['invalidDecimalString'] || errs['invalidDecimal']) {
      errors.push(custom['invalidDecimalString'] ?? `Debe ser un valor numérico válido (con hasta 4 decimales, sin comas).`);
    }

    if (errs['dateRangeInvalid'] || errs['rangoInvalido']) {
      errors.push(custom['dateRangeInvalid'] ?? `La fecha final no puede ser anterior a la fecha inicial.`);
    }

    if (errs['futureDate']) {
      errors.push(custom['futureDate'] ?? `La fecha no puede ser futura.`);
    }

    if (errs['pastDate']) {
      errors.push(custom['pastDate'] ?? `La fecha no puede ser en el pasado.`);
    }

    // Direct string errors or custom error object messages
    for (const key in errs) {
      if (
        [
          'required',
          'minlength',
          'maxlength',
          'email',
          'min',
          'max',
          'pattern',
          'invalidCurp',
          'curpInvalido',
          'curp',
          'invalidRfc',
          'rfcInvalido',
          'rfc',
          'invalidPhone',
          'telefonoInvalido',
          'phone',
          'invalidClabe',
          'clabeInvalida',
          'clabe',
          'passwordsMismatch',
          'passwordMismatch',
          'invalidDecimalString',
          'invalidDecimal',
          'dateRangeInvalid',
          'rangoInvalido',
          'futureDate',
          'pastDate'
        ].includes(key)
      ) {
        continue;
      }

      if (custom[key]) {
        errors.push(custom[key]);
      } else if (typeof errs[key] === 'string') {
        errors.push(errs[key]);
      } else if (errs[key] && typeof errs[key] === 'object' && typeof errs[key]['message'] === 'string') {
        errors.push(errs[key]['message']);
      }
    }

    if (errors.length === 0 && this.control.invalid) {
      errors.push(custom['default'] ?? `${this.label} contiene un valor inválido.`);
    }

    return errors;
  }
}
