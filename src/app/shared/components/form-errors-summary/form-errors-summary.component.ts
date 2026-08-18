import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-errors-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="hasErrors" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm" role="alert" aria-live="assertive">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            No pudimos guardar la información.
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p>Revisa los campos marcados a continuación para corregir los errores.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FormErrorsSummaryComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup | FormArray;
  hasErrors = false;
  private sub = new Subscription();

  ngOnInit() {
    if (!this.form) return;
    
    // Solo actualizamos la visibilidad del banner si cambian los errores.
    // NO hacemos focus robando la atención del usuario mientras escribe.
    this.sub.add(
      this.form.statusChanges.subscribe(() => {
        this.hasErrors = this.hasAnyError(this.form);
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * Se debe invocar manualmente (via ViewChild) después de un submit fallido o autosave fallido
   * para evaluar y hacer scroll al primer error.
   */
  public reportErrors() {
    this.hasErrors = this.hasAnyError(this.form);
    if (this.hasErrors) {
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid, [aria-invalid="true"]') as HTMLElement;
        if (firstInvalidControl) {
          firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus explicitly to the input if possible
          const input = firstInvalidControl.matches('input, select, textarea') 
            ? firstInvalidControl 
            : firstInvalidControl.querySelector('input, select, textarea') as HTMLElement;
            
          if (input) {
            input.focus({ preventScroll: true });
          }
        }
      }, 100);
    }
  }

  private hasAnyError(form: AbstractControl): boolean {
    if (form.invalid && form.touched) return true;
    if (form.errors?.['server']) return true;
    
    if (form instanceof FormGroup) {
      return Object.keys(form.controls).some(key => this.hasAnyError(form.controls[key]));
    } else if (form instanceof FormArray) {
      return form.controls.some(ctrl => this.hasAnyError(ctrl));
    }
    
    return false;
  }
}
