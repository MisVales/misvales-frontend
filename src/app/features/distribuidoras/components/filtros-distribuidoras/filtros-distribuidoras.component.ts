import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FiltroDistribuidoras } from '../../models/filtro-distribuidoras.model';

@Component({
  selector: 'app-filtros-distribuidoras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtros-distribuidoras.component.html',
  styleUrls: ['./filtros-distribuidoras.component.css']
})
export class FiltrosDistribuidorasComponent {
  @Output() filtrosCambiados = new EventEmitter<FiltroDistribuidoras>();
  
  filtrosForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      search: [''],
      branch_id: [''],
      coordinator_id: [''],
      category_id: [''],
      status: ['']
    });
  }

  aplicarFiltros() {
    this.filtrosCambiados.emit(this.filtrosForm.value);
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.filtrosCambiados.emit({});
  }
}
