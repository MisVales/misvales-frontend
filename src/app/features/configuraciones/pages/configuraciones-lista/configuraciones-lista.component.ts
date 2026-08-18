import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfiguracionDefinicion, ConfigurationValue } from '../../data-access/configuraciones.dtos';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';

@Component({
  selector: 'app-configuraciones-lista',
  imports: [CommonModule],
  templateUrl: './configuraciones-lista.component.html',
  styleUrls: ['./configuraciones-lista.component.css'],
})
export class ConfiguracionesListaComponent implements OnInit {
  protected readonly store = inject(ConfiguracionesStore);
  private readonly router = inject(Router);
  protected readonly buscar = signal('');
  protected readonly definicionesFiltradas = computed(() => {
    const term = this.buscar().trim().toLocaleLowerCase('es-MX');
    if (!term) return this.store.definiciones();
    return this.store
      .definiciones()
      .filter((item) => `${item.clave} ${item.nombre}`.toLocaleLowerCase('es-MX').includes(term));
  });

  ngOnInit(): void {
    void this.store.listar();
  }

  protected abrir(definition: ConfiguracionDefinicion): void {
    void this.router.navigate(['/configuraciones', definition.clave]);
  }

  protected mostrarValor(definition: ConfiguracionDefinicion): string {
    const value = definition.valorActual;
    if (value === null) return 'Sin versión vigente';
    if (definition.clave === 'RELATION_PAYMENT_BANK') return 'Datos publicados';
    if (definition.clave === 'EARLY_PAYMENT_PERIOD' && this.isObject(value)) {
      return `Día ${String(value['start'])} al ${String(value['end'])}`;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    const unit = this.etiquetaUnidad(definition.unidad);
    return `${String(value)}${unit ? ` ${unit}` : ''}`;
  }

  protected etiquetaTipo(type: ConfiguracionDefinicion['tipoValor']): string {
    const labels: Record<ConfiguracionDefinicion['tipoValor'], string> = {
      INTEGER: 'Número entero',
      DECIMAL: 'Número decimal',
      PERCENTAGE: 'Porcentaje',
      TIME: 'Hora',
      TIMEZONE: 'Zona horaria',
      DURATION: 'Duración',
      DATE: 'Fecha',
      TIME_RANGE: 'Rango de horas',
      STRING: 'Texto',
      JSON: 'Datos estructurados',
    };
    return labels[type];
  }

  private etiquetaUnidad(unit: string | null): string | null {
    if (unit === null) return null;

    const labels: Record<string, string> = {
      day_of_month: 'días',
      days: 'días',
      days_after_cutoff: 'días después del corte',
      hours: 'horas',
      minutes: 'minutos',
      percentage: '%',
    };

    return labels[unit] ?? unit.replaceAll('_', ' ');
  }

  private isObject(value: ConfigurationValue): value is { [key: string]: ConfigurationValue } {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
