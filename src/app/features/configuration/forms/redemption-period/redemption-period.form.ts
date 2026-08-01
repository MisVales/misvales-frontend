import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface RedemptionPeriodFormData {
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

@Component({
  selector: 'app-redemption-period-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nombre del Periodo</label>
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
        <label class="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
        <textarea
          formControlName="description"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Fecha de Inicio (America/Monterrey)</label>
        <input
          type="datetime-local"
          formControlName="startsAt"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('startsAt')?.invalid && form.get('startsAt')?.touched" class="text-red-500 text-xs mt-1">
          La fecha de inicio es obligatoria.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Fecha de Fin (America/Monterrey)</label>
        <input
          type="datetime-local"
          formControlName="endsAt"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <div *ngIf="form.get('endsAt')?.invalid && form.get('endsAt')?.touched" class="text-red-500 text-xs mt-1">
          La fecha de fin es obligatoria.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Motivo de Creación (Opcional)</label>
        <textarea
          formControlName="reason"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        ></textarea>
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
          {{ isSubmitting ? 'Guardando...' : 'Crear Borrador' }}
        </button>
      </div>
    </form>
  `
})
export class RedemptionPeriodFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() set initialData(data: RedemptionPeriodFormData | null) {
    if (data) {
      this.form.patchValue(data);
    } else {
      this.form.reset();
    }
  }
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<RedemptionPeriodFormData>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required],
    reason: ['']
  });

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as RedemptionPeriodFormData);
    }
  }
}
