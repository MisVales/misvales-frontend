import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { FiltrosDistribuidorasComponent } from '../../components/filtros-distribuidoras/filtros-distribuidoras.component';
import { Router } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';
import { CandidatoActivacion, DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';

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
  
  private readonly session = inject(SessionStore);
  private readonly api = inject(DistribuidorasApiService);
  candidatos: CandidatoActivacion[] = [];
  readonly esVistaGlobal = this.session.permissions().includes('distributors.view_any');
  readonly puedeActivar = this.session.permissions().includes('distributors.activate');
  
  ngOnInit() {
    this.store.listar(1, 10, {});
    if (this.puedeActivar) this.api.candidatosActivacion().subscribe({ next: items => this.candidatos = items });
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

  completarAlta(id: string) { this.router.navigate(['/distribuidoras/altas', id]); }
}
