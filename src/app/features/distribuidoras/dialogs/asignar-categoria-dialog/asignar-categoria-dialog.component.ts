import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignDistributorCategoryRequestDto } from '../../data-access/dtos/assign-distributor-category-request.dto';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';

@Component({
  selector: 'app-asignar-categoria-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignar-categoria-dialog.component.html',
  styleUrls: ['./asignar-categoria-dialog.component.css']
})
export class AsignarCategoriaDialogComponent implements OnInit {
  @Input() categoriaActualId?: string;
  @Output() confirmar = new EventEmitter<AssignDistributorCategoryRequestDto>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  private readonly api = inject(DistribuidorasApiService);
  categoriasDisponibles: Array<{ id: string; nombre: string }> = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category_version_id: ['', Validators.required],
      starts_at: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.api.categoriasDisponibles().subscribe({
      next: categorias => this.categoriasDisponibles = categorias.map(item => ({ id: item.category_version_id, nombre: item.name }))
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
