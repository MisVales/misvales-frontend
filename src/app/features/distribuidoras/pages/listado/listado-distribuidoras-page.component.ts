import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { FiltrosDistribuidorasComponent } from '../../components/filtros-distribuidoras/filtros-distribuidoras.component';
import { Router } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-listado-distribuidoras-page',
  standalone: true,
  imports: [CommonModule, FiltrosDistribuidorasComponent],
  templateUrl: './listado-distribuidoras-page.component.html',
  styleUrls: ['./listado-distribuidoras-page.component.css']
})
export class ListadoDistribuidorasPageComponent implements OnInit {
  store = inject(DistribuidorasStore);
  router = inject(Router);
  private session = inject(SessionStore);
  userRole = computed<'GERENTE' | 'COORDINADOR' | 'DISTRIBUIDORA'>(() => {
    const roles = this.session.roles();
    if (roles.includes('distributor')) return 'DISTRIBUIDORA';
    if (roles.includes('coordinator')) return 'COORDINADOR';
    return 'GERENTE';
  });
  
  ngOnInit() {
    this.store.listar(1, 10, {});
  }

  onFiltrosCambiados(filtros: any) {
    this.store.listar(1, 10, filtros);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.store.paginacion().ultimaPagina) {
      this.store.listar(pagina, this.store.paginacion().porPagina, this.store.filtros());
    }
  }

  irADetalle(id: string) {
    this.router.navigate(['/distribuidoras', id]);
  }
}
