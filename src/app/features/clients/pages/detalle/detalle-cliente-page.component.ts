import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesStore } from '../../state/clientes.store';

@Component({
  selector: 'app-detalle-cliente-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-cliente-page.component.html',
  styleUrls: ['./detalle-cliente-page.component.css']
})
export class DetalleClientePageComponent implements OnInit, OnDestroy {
  store = inject(ClientesStore);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.cargarDetalle(id);
      }
    });
  }

  ngOnDestroy() {
    this.store.limpiarDetalle();
  }
}
