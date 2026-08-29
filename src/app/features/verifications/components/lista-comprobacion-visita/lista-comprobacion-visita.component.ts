import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export interface PuntoComprobacion {
  id: string;
  seccion: string;
  campo: string;
  etiqueta: string;
  datoDeclarado: string;
  grupo: string;
  registro: string;
  registroId?: string;
  estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA' | null;
  diferenciaRegistrada?: boolean;
}

interface RegistroComprobacion {
  key: string;
  nombre: string;
  puntos: PuntoComprobacion[];
}

interface GrupoComprobacion {
  nombre: string;
  puntos: PuntoComprobacion[];
  registros: RegistroComprobacion[];
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
  
  cambiarEstadoPunto = output<{ puntoId: string; estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA' }>();
  cambiarEstadoGrupo = output<{ grupo: string; estado: 'COMPROBADO' }>();
  registrarDiferencia = output<PuntoComprobacion>();
  quitarDiferencia = output<PuntoComprobacion>();

  private readonly gruposEnDiferencia = signal<Set<string>>(new Set());

  protected readonly grupos = computed(() => {
    const agrupados = new Map<string, PuntoComprobacion[]>();
    for (const punto of this.puntos()) {
      agrupados.set(punto.grupo, [...(agrupados.get(punto.grupo) ?? []), punto]);
    }
    return [...agrupados.entries()].map(([nombre, puntos]): GrupoComprobacion => {
      const registros = new Map<string, PuntoComprobacion[]>();
      for (const punto of puntos) {
        const key = punto.registro || '__sin-registro__';
        registros.set(key, [...(registros.get(key) ?? []), punto]);
      }

      return {
        nombre,
        puntos,
        registros: [...registros.entries()].map(([key, registroPuntos]) => ({
          key,
          nombre: key === '__sin-registro__' ? '' : (registroPuntos[0]?.registro ?? ''),
          puntos: registroPuntos,
        })),
      };
    });
  });

  isGrupoEnDiferencia(nombre: string): boolean {
    return this.gruposEnDiferencia().has(nombre);
  }

  activarDiferencias(grupo: GrupoComprobacion) {
    if (this.isReadonly()) return;
    this.gruposEnDiferencia.update((actuales) => {
      const siguientes = new Set(actuales);
      siguientes.add(grupo.nombre);
      return siguientes;
    });
  }

  onEstadoGrupoChange(grupo: GrupoComprobacion, estado: 'COMPROBADO') {
    if (this.isReadonly()) return;
    this.gruposEnDiferencia.update((actuales) => {
      const siguientes = new Set(actuales);
      siguientes.delete(grupo.nombre);
      return siguientes;
    });
    this.cambiarEstadoGrupo.emit({ grupo: grupo.nombre, estado });
  }

  onEstadoChange(punto: PuntoComprobacion, nuevoEstado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA') {
    if (this.isReadonly()) return;
    this.cambiarEstadoPunto.emit({ puntoId: punto.id, estado: nuevoEstado });
  }

  onRegistrarDiferencia(punto: PuntoComprobacion) {
    if (this.isReadonly()) return;
    this.registrarDiferencia.emit(punto);
  }

  onQuitarDiferencia(punto: PuntoComprobacion) {
    if (this.isReadonly()) return;
    this.quitarDiferencia.emit(punto);
  }

  cantidadDiferencias(grupo: GrupoComprobacion): number {
    return grupo.puntos.filter((punto) => punto.estado === 'DIFERENCIA').length;
  }
}
