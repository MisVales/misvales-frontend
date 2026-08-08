import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfiguracionesStore } from '../../state/configurations.store';
import { ConfiguracionDTO } from '../../data-access/configurations.dtos';

@Component({
  selector: 'app-configurations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurations-list.component.html',
  styleUrls: ['./configurations-list.component.css']
})
export class ConfiguracionesListaComponent implements OnInit {
  protected store = inject(ConfiguracionesStore);
  private router = inject(Router);

  ngOnInit() {
    this.store.listar();
  }

  get configuracionesCredito(): ConfiguracionDTO[] {
    return this.store.datos().filter(c => c.grupo === 'Crédito');
  }

  get configuracionesRecargos(): ConfiguracionDTO[] {
    return this.store.datos().filter(c => c.grupo === 'Recargos y Penalizaciones');
  }

  get configuracionesFechas(): ConfiguracionDTO[] {
    return this.store.datos().filter(c => c.grupo === 'Fechas y Horarios');
  }

  goToDetail(clave: string) {
    this.router.navigate(['/configuraciones', clave]);
  }
}
