import { Component, Output, EventEmitter, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignDistributorCategoryRequestDto } from '../../data-access/dtos/assign-distributor-category-request.dto';
import { CategoriasService } from '../../../categorias/data-access/categorias.service';
import { CategoryDto } from '../../../categorias/data-access/categorias.dtos';

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
  private categoriesApi = inject(CategoriasService);
  categorias = signal<CategoryDto[]>([]);
  cargandoCategorias = signal(true);
  errorCategorias = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category_version_id: ['', Validators.required],
      starts_at: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.categoriesApi.listar(1, 100).subscribe({
      next: response => { this.categorias.set(response.data.filter(category => category.status === 'ACTIVE' && category.version_status === 'PUBLISHED' && !!category.version_id)); this.cargandoCategorias.set(false); },
      error: () => { this.errorCategorias.set('No fue posible cargar las categorías publicadas.'); this.cargandoCategorias.set(false); },
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
