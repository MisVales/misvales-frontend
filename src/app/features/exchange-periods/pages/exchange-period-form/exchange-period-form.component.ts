import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PeriodosCanjeStore } from '../../state/exchange-periods.store';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-exchange-period-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exchange-period-form.component.html',
  styleUrls: ['./exchange-period-form.component.css']
})
export class PeriodoFormularioComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(PeriodosCanjeStore);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      valorPunto: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]]
    }, { validators: this.fechasValidas });
  }

  // Validator: Impedir que fecha final sea anterior/igual a la inicial
  fechasValidas(g: FormGroup) {
    const start = g.get('fechaInicio')?.value;
    const end = g.get('fechaFin')?.value;
    if (start && end) {
      if (new Date(end) <= new Date(start)) {
        return { fechasInvalidas: true };
      }
    }
    return null;
  }

  // Convertir fecha local del navegador a ISO en America/Monterrey
  private toMonterreyISOString(localDateStr: string): string {
    if (!localDateStr) return '';
    const dt = DateTime.fromISO(localDateStr, { zone: 'America/Monterrey' });
    return dt.isValid ? (dt.toISO() as string) : '';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload = {
      nombre: this.form.value.nombre,
      fechaInicio: this.toMonterreyISOString(this.form.value.fechaInicio),
      fechaFin: this.toMonterreyISOString(this.form.value.fechaFin),
      valorPunto: this.form.value.valorPunto.toString()
    };

    if (!payload.fechaInicio || !payload.fechaFin) {
      console.error('Fechas inválidas');
      return;
    }

    // Aquí iría lógica para editar si estuviéramos en modo edición
    this.store.crearPeriodo(payload);
  }

  onCancel() {
    this.form.reset();
    this.store.limpiarStore();
    this.router.navigate(['/periodos-canje']);
  }
}
