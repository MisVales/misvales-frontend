import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';
import { FiltrosClientesComponent } from '../../components/filtros-clientes/filtros-clientes.component';
import { ClientesStore } from '../../state/clientes.store';

@Component({
  selector: 'app-listado-clientes-page',
  imports: [CommonModule, RouterLink, FiltrosClientesComponent],
  templateUrl: './listado-clientes-page.component.html',
  styleUrls: ['./listado-clientes-page.component.css'],
})
export class ListadoClientesPageComponent implements OnInit {
  readonly store = inject(ClientesStore);
  private readonly sessionStore = inject(SessionStore);

  ngOnInit(): void { this.store.cargarListado(); }

  isMobileRole(): boolean { return this.sessionStore.roles().includes('distributor'); }
  canCreate(): boolean {
    return this.sessionStore.roles().includes('distributor') && this.sessionStore.permissions().includes('clients.create');
  }
  totalPages(): number { return Math.max(1, Math.ceil(this.store.paginacion().total / (this.store.filtros().perPage ?? 10))); }
}
