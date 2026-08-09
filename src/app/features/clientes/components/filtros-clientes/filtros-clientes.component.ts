import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientesStore } from '../../state/clientes.store';

@Component({
  selector: 'app-filtros-clientes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtros-clientes.component.html',
  styleUrls: ['./filtros-clientes.component.css']
})
export class FiltrosClientesComponent implements OnInit {
  store = inject(ClientesStore);
  fb = inject(FormBuilder);
  
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

  ngOnInit() {
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
