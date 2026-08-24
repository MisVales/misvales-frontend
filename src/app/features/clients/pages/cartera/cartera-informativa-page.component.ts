import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientesStore } from '../../state/clientes.store';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-cartera-informativa-page',
  imports: [CommonModule, RouterLink, StatusLabelPipe],
  templateUrl: './cartera-informativa-page.component.html'
})
export class CarteraInformativaPageComponent implements OnInit {
  readonly store = inject(ClientesStore);
  ngOnInit(): void { this.store.cargarListado(); }
}
