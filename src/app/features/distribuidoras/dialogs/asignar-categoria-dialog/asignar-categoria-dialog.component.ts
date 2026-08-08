import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignDistributorCategoryRequestDto } from '../../data-access/dtos/assign-distributor-category-request.dto';

@Component({
  selector: 'app-asignar-categoria-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignar-categoria-dialog.component.html',
  styleUrls: ['./asignar-categoria-dialog.component.css']
})
export class AsignarCategoriaDialogComponent {
  @Input() categoriaActualId?: string;
  @Output() confirmar = new EventEmitter<AssignDistributorCategoryRequestDto>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  categoriasSimuladas = [
    { id: 'cat-1', nombre: 'Plata', porcentaje: '10.0', inicioVigencia: '2023-01-01' },
    { id: 'cat-2', nombre: 'Oro', porcentaje: '12.5', inicioVigencia: '2023-01-01' }
  ]; // In a real scenario, these would come from an API endpoint for published categories

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category_version_id: ['', Validators.required],
      starts_at: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.confirmar.emit(this.form.value);
    }
  }

  cerrar() {
    this.cancelar.emit();
  }
}
