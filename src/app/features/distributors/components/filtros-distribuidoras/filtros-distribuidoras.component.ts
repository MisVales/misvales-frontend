import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FiltroDistribuidoras } from '../../models/filtro-distribuidoras.model';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { CategoriasService } from '../../../categories/data-access/categorias.service';
import { firstValueFrom } from 'rxjs';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-filtros-distribuidoras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RefactorSelectComponent],
  templateUrl: './filtros-distribuidoras.component.html',
  styleUrls: ['./filtros-distribuidoras.component.css'],
})
export class FiltrosDistribuidorasComponent implements OnInit {
  @Output() filtrosCambiados = new EventEmitter<FiltroDistribuidoras>();

  filtrosForm: FormGroup;
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly categoriesApi = inject(CategoriasService);
  branches: Array<{ id: string; name: string }> = [];
  coordinators: Array<{ id: string; name: string }> = [];
  categories: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      search: [''],
      branch_id: [''],
      coordinator_id: [''],
      category_id: [''],
      status: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    const [branches, personnel, categories] = await Promise.all([
      firstValueFrom(this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' })),
      firstValueFrom(
        this.organizationApi.getPersonnel({ per_page: 100, assignment_status: 'ACTIVE' }),
      ),
      firstValueFrom(this.categoriesApi.listar(1, 100)),
    ]);
    this.branches = branches.data.map((branch) => ({ id: branch.id, name: branch.name }));
    this.coordinators = personnel.data
      .filter((assignment) => assignment.role.code === 'coordinator')
      .map((assignment) => ({ id: assignment.user.id, name: assignment.user.name }));
    this.categories = categories.data.map((category) => ({ id: category.id, name: category.name }));
  }

  aplicarFiltros() {
    this.filtrosCambiados.emit(this.filtrosForm.value);
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.filtrosCambiados.emit({});
  }
}
