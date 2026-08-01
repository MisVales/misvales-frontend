import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CategoryFormData {
  name: string;
  description: string;
  distributorProfitRate: string;
}

@Component({
  selector: 'app-category-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nombre de Categoría</label>
        <input
          type="text"
          formControlName="name"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-500 text-xs mt-1">
          El nombre es obligatorio.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          formControlName="description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        ></textarea>
        <div *ngIf="form.get('description')?.invalid && form.get('description')?.touched" class="text-red-500 text-xs mt-1">
          La descripción es obligatoria.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Tasa de Ganancia de Distribuidora (Decimal, ej: 0.20)</label>
        <input
          type="text"
          formControlName="distributorProfitRate"
          placeholder="Ej: 0.2000"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('distributorProfitRate')?.invalid && form.get('distributorProfitRate')?.touched" class="text-red-500 text-xs mt-1">
          Ingrese un formato decimal válido.
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
export class CategoryVersionFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() set initialData(data: CategoryFormData | null) {
    if (data) {
      this.form.patchValue(data);
    } else {
      this.form.reset();
    }
  }
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<CategoryFormData>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    distributorProfitRate: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as CategoryFormData);
    }
  }
}
