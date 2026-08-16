import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ErrorMapperService {

  /**
   * Recibe el objeto `fields` del backend (ej. { "address.street": ["El campo es requerido"] })
   * y mapea los errores al formulario correspondiente.
   */
  public applyServerErrors(form: FormGroup | FormArray, errors: Record<string, string[]> | null | undefined): void {
    if (!errors) return;

    for (const [fieldPath, messages] of Object.entries(errors)) {
      if (!messages || messages.length === 0) continue;
      
      const control = this.findControl(form, fieldPath);
      if (control) {
        // Establecer el error usando la llave "server"
        control.setErrors({ ...control.errors, server: messages[0] });
        control.markAsTouched();
      }
    }
  }

  /**
   * Limpia recursivamente todos los errores de tipo "server" en el formulario.
   * Esto se debe invocar antes de un submit o autosave para limpiar errores resueltos.
   */
  public clearServerErrors(form: FormGroup | FormArray): void {
    Object.keys(form.controls).forEach(key => {
      const control = (form.controls as any)[key] as AbstractControl;
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.clearServerErrors(control);
      } else {
        if (control.errors && control.errors['server']) {
          const { server, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
    });
  }

  /**
   * Permite encontrar controles anidados usando dot-notation (ej. "vehicles.0.model")
   */
  private findControl(form: FormGroup | FormArray, path: string): AbstractControl | null {
    const parts = path.split('.');
    let currentControl: AbstractControl | null = form;

    for (const part of parts) {
      if (currentControl instanceof FormGroup || currentControl instanceof FormArray) {
        currentControl = currentControl.get(part);
      } else {
        return null;
      }
      if (!currentControl) return null;
    }

    return currentControl;
  }
}
