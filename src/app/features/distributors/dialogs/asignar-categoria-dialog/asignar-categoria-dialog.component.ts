import { Component, Output, EventEmitter, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignDistributorCategoryRequestDto } from '../../data-access/dtos/assign-distributor-category-request.dto';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { CategoryDto } from '../../../categories/data-access/categorias.dtos';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-asignar-categoria-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, RefactorSelectComponent],
  templateUrl: './asignar-categoria-dialog.component.html',
  styleUrls: ['./asignar-categoria-dialog.component.css'],
})
export class AsignarCategoriaDialogComponent implements OnInit {
  @Input() categoriaActualId?: string;
  @Output() confirmar = new EventEmitter<AssignDistributorCategoryRequestDto>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  private distributorsApi = inject(DistribuidorasApiService);
  categorias = signal<CategoryDto[]>([]);
  cargandoCategorias = signal(true);
  errorCategorias = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category_version_id: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.distributorsApi.categoriasDisponiblesParaActivacion().subscribe({
      next: (categories) => {
        this.categorias.set(
          categories.filter(
            (category) =>
              category.status === 'ACTIVE' &&
              category.version_status === 'PUBLISHED' &&
              !!category.version_id,
          ),
        );
        this.cargandoCategorias.set(false);
      },
      error: () => {
        this.errorCategorias.set('No fue posible cargar las categorías publicadas.');
        this.cargandoCategorias.set(false);
      },
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
