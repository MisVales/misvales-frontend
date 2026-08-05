import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientesStore } from '../../state/clientes.store';
import { FiltrosClientesComponent } from '../../components/filtros-clientes/filtros-clientes.component';

@Component({
  selector: 'app-listado-clientes-page',
  imports: [CommonModule, RouterLink, FiltrosClientesComponent],
  templateUrl: './listado-clientes-page.component.html',
  styleUrls: ['./listado-clientes-page.component.css']
})
export class ListadoClientesPageComponent implements OnInit {
  store = inject(ClientesStore);
  
  // En un entorno real se obtendría del AuthService global
  userRole = 'GERENTE_GENERAL'; // Mock for now: 'DISTRIBUIDORA', 'COORDINADOR', etc.

  ngOnInit() {
    this.store.cargarListado();
  }

  isMobileRole(): boolean {
    return this.userRole === 'DISTRIBUIDORA';
  }
}
