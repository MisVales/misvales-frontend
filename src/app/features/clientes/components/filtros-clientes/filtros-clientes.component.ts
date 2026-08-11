import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientesStore } from '../../state/clientes.store';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { DistribuidorasApiService } from '../../../distribuidoras/data-access/api/distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-filtros-clientes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtros-clientes.component.html',
  styleUrls: ['./filtros-clientes.component.css']
})
export class FiltrosClientesComponent implements OnInit {
  store = inject(ClientesStore);
  fb = inject(FormBuilder);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly distributorsApi = inject(DistribuidorasApiService);
  branches: Array<{ id: string; name: string }> = [];
  distributors: Array<{ id: string; numero: string; nombreCompleto: string }> = [];
  
  filtrosForm: FormGroup;

  constructor() {
    this.filtrosForm = this.fb.group({
      search: [''],
      branchId: [''],
      distributorId: [''],
      status: [''],
      hasBalance: ['']
    });
  }

  async ngOnInit() {
    const [branches, distributors] = await Promise.all([
      firstValueFrom(this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' })),
      firstValueFrom(this.distributorsApi.listar(1, 100, {})),
    ]);
    this.branches = branches.data.map((branch) => ({ id: branch.id, name: branch.name }));
    this.distributors = distributors.datos.map((distributor) => ({ id: distributor.id, numero: distributor.numero, nombreCompleto: distributor.nombreCompleto }));
    const currentFilters = this.store.filtros();
    this.filtrosForm.patchValue(currentFilters, { emitEvent: false });
    
    this.filtrosForm.valueChanges.subscribe(val => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.store.actualizarFiltros(this.filtrosForm.value);
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.store.actualizarFiltros({});
  }
}
