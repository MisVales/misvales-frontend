import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface PuntoComprobacion {
  id: string;
  seccion: string;
  campo: string;
  etiqueta: string;
  datoDeclarado: unknown;
  estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA' | null;
  diferenciaRegistrada?: boolean;
}

@Component({
  selector: 'app-lista-comprobacion-visita',
  standalone: true,
  templateUrl: './lista-comprobacion-visita.component.html',
  styleUrl: './lista-comprobacion-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaComprobacionVisitaComponent {
  puntos = input<PuntoComprobacion[]>([]);
  isReadonly = input<boolean>(false);

  cambiarEstadoPunto = output<{
    puntoId: string;
    estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA';
  }>();
  registrarDiferencia = output<PuntoComprobacion>();

  onEstadoChange(punto: PuntoComprobacion, nuevoEstado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA') {
    if (this.isReadonly()) return;
    this.cambiarEstadoPunto.emit({ puntoId: punto.id, estado: nuevoEstado });
  }

  onRegistrarDiferencia(punto: PuntoComprobacion) {
    if (this.isReadonly()) return;
    this.registrarDiferencia.emit(punto);
  }
}
