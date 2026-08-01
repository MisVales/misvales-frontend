import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ConfigurationValueType } from '../../data-access/dtos/configuration.dto';

export interface ConfigurationFormData {
  key: string;
  type: ConfigurationValueType;
  value: string | any;
}

@Component({
  selector: 'app-configuration-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Clave de Configuración</label>
        <select
          formControlName="key"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          (change)="onKeyChange()"
        >
          <option value="" disabled>Seleccione una clave</option>
          <option *ngFor="let option of SUPPORTED_KEYS" [value]="option.key">
            {{ option.key }}
          </option>
        </select>
      </div>

      <div *ngIf="selectedKeyType">
        <label class="block text-sm font-medium text-gray-700">Valor ({{ selectedKeyType }})</label>
        
        <!-- Input para Integer -->
        <input
          *ngIf="selectedKeyType === 'integer'"
          type="number"
          step="1"
          formControlName="value"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />

        <!-- Input para Dinero o Porcentaje (como texto decimal) -->
        <input
          *ngIf="selectedKeyType === 'money' || selectedKeyType === 'percentage'"
          type="text"
          formControlName="value"
          placeholder="Ej: 500.00 o 0.2000"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />

        <!-- Input para Tiempo u Hora -->
        <input
          *ngIf="selectedKeyType === 'time'"
          type="time"
          step="1"
          formControlName="value"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />

        <!-- Input para Zona Horaria -->
        <select
          *ngIf="selectedKeyType === 'timezone'"
          formControlName="value"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="America/Monterrey">America/Monterrey</option>
          <option value="America/Mexico_City">America/Mexico_City</option>
        </select>

        <!-- Placeholder para Object tipado (se podría expandir luego) -->
        <textarea
          *ngIf="selectedKeyType === 'typed_object'"
          formControlName="value"
          rows="4"
          placeholder="Ingrese un JSON válido según el contrato"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono text-sm"
        ></textarea>
        
        <div *ngIf="form.get('value')?.invalid && form.get('value')?.touched" class="text-red-500 text-xs mt-1">
          El valor proporcionado no es válido para este tipo.
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
          {{ isSubmitting ? 'Guardando...' : 'Guardar Borrador' }}
        </button>
      </div>
    </form>
  `
})
export class ConfigurationVersionFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() set initialData(data: ConfigurationFormData | null) {
    if (data) {
      this.form.patchValue(data);
      this.selectedKeyType = data.type;
    }
  }
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<ConfigurationFormData>();
  @Output() cancel = new EventEmitter<void>();

  // Catálogo estático basado en el contrato
  readonly SUPPORTED_KEYS = [
    { key: 'CUT_DAY_OF_MONTH', type: 'integer' },
    { key: 'PAYMENT_DAYS_AFTER_CUT', type: 'integer' },
    { key: 'EARLY_PAYMENT_PERIOD', type: 'typed_object' },
    { key: 'BUSINESS_TIMEZONE', type: 'timezone' },
    { key: 'CUT_TIME', type: 'time' },
    { key: 'PAYMENT_DEADLINE_TIME', type: 'time' },
    { key: 'BANK_UPLOAD_DEADLINE_TIME', type: 'time' },
    { key: 'POST_DUE_EVALUATION_TIME', type: 'time' },
    { key: 'CREDIT_TOLERANCE_AMOUNT', type: 'money' },
    { key: 'LATE_FEE_AMOUNT', type: 'money' },
    { key: 'POINTS_DIVISOR_AMOUNT', type: 'money' },
    { key: 'POINTS_MULTIPLIER', type: 'integer' },
    { key: 'POINT_VALUE_AMOUNT', type: 'money' },
    { key: 'LATE_POINTS_REDUCTION_RATE', type: 'percentage' }
  ] as const;

  selectedKeyType: ConfigurationValueType | null = null;

  readonly form = this.fb.group({
    key: ['', Validators.required],
    value: ['', Validators.required]
  });

  onKeyChange() {
    const selectedKey = this.form.get('key')?.value;
    const config = this.SUPPORTED_KEYS.find(k => k.key === selectedKey);
    if (config) {
      this.selectedKeyType = config.type as ConfigurationValueType;
      this.form.get('value')?.setValue('');
      // Limpiar validadores adicionales si los hubiera
      if (this.selectedKeyType === 'money' || this.selectedKeyType === 'percentage') {
        // En un caso real se inyectaría un validador decimal
        this.form.get('value')?.setValidators([Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]);
      } else {
        this.form.get('value')?.setValidators([Validators.required]);
      }
      this.form.get('value')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      // Si es JSON object intentamos parsearlo
      let finalValue = this.form.value.value;
      if (this.selectedKeyType === 'typed_object' && typeof finalValue === 'string') {
        try {
          finalValue = JSON.parse(finalValue);
        } catch (e) {
          this.form.get('value')?.setErrors({ invalidJson: true });
          return;
        }
      }
      
      this.save.emit({
        key: this.form.value.key as string,
        type: this.selectedKeyType as ConfigurationValueType,
        value: finalValue
      });
    }
  }
}
