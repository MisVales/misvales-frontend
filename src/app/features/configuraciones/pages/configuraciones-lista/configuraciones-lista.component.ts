import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import { ConfiguracionDefinicion } from '../../data-access/configuraciones.dtos';

@Component({
  selector: 'app-configuraciones-lista',
  imports: [CommonModule],
  templateUrl: './configuraciones-lista.component.html',
  styleUrls: ['./configuraciones-lista.component.css']
})
export class ConfiguracionesListaComponent implements OnInit {
  protected store = inject(ConfiguracionesStore);
  private router = inject(Router);

  ngOnInit() {
    this.store.listar();
  }

  get configuracionesCredito(): ConfiguracionDefinicion[] {
    return this.store.definiciones().filter(c => c.grupo === 'Crédito');
  }

  get configuracionesRecargos(): ConfiguracionDefinicion[] {
    return this.store.definiciones().filter(c => c.grupo === 'Recargos y Penalizaciones');
  }

  get configuracionesFechas(): ConfiguracionDefinicion[] {
    return this.store.definiciones().filter(c => c.grupo === 'Fechas y Horarios');
  }

  goToDetail(clave: string) {
    this.router.navigate(['/configuraciones', clave]);
  }
}
