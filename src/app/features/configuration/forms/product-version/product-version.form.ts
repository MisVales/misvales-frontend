import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ProductFormData {
  amount: string;
  loanCommissionRate: string;
  interestRatePerFortnight: string;
  insuranceAmount: string;
  fortnightCount: number;
}

@Component({
  selector: 'app-product-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Monto del Producto</label>
        <input
          type="text"
          formControlName="amount"
          placeholder="Ej: 5000.00"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('amount')?.invalid && form.get('amount')?.touched" class="text-red-500 text-xs mt-1">
          Ingrese un formato decimal válido.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Comisión por Préstamo (Tasa)</label>
        <input
          type="text"
          formControlName="loanCommissionRate"
          placeholder="Ej: 0.1000"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('loanCommissionRate')?.invalid && form.get('loanCommissionRate')?.touched" class="text-red-500 text-xs mt-1">
          Ingrese un formato decimal válido.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Tasa de Interés por Quincena</label>
        <input
          type="text"
          formControlName="interestRatePerFortnight"
          placeholder="Ej: 0.0500"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('interestRatePerFortnight')?.invalid && form.get('interestRatePerFortnight')?.touched" class="text-red-500 text-xs mt-1">
          Ingrese un formato decimal válido.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Monto de Seguro</label>
        <input
          type="text"
          formControlName="insuranceAmount"
          placeholder="Ej: 150.00"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('insuranceAmount')?.invalid && form.get('insuranceAmount')?.touched" class="text-red-500 text-xs mt-1">
          Ingrese un formato decimal válido.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Número de Quincenas</label>
        <input
          type="number"
          step="1"
          formControlName="fortnightCount"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('fortnightCount')?.invalid && form.get('fortnightCount')?.touched" class="text-red-500 text-xs mt-1">
          El número de quincenas es obligatorio y numérico.
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          (click)="cancel.emit()"
          class="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="form.invalid || isSubmitting"
          class="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  `
})
export class ProductVersionFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() set initialData(data: ProductFormData | null) {
    if (data) {
      this.form.patchValue(data);
    } else {
      this.form.reset();
    }
  }
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<ProductFormData>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    amount: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
    loanCommissionRate: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
    interestRatePerFortnight: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
    insuranceAmount: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
    fortnightCount: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as ProductFormData);
    }
  }
}
