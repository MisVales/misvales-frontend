import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CapturaEvidenciaComponent } from '../../components/captura-evidencia/captura-evidencia.component';
import {
  EditorDiferenciasComponent,
  DiferenciaPayload,
} from '../../components/editor-diferencias/editor-diferencias.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import {
  ListaComprobacionVisitaComponent,
  PuntoComprobacion,
} from '../../components/lista-comprobacion-visita/lista-comprobacion-visita.component';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';

interface CampoDeclarado {
  id: string;
  label: string;
  valorOriginal: unknown;
}

@Component({
  selector: 'app-realizar-visita',
  standalone: true,
  imports: [
    ListaComprobacionVisitaComponent,
    CapturaEvidenciaComponent,
    GaleriaEvidenciasComponent,
    EditorDiferenciasComponent,
    FormsModule,
  ],
  templateUrl: './realizar-visita.component.html',
  styleUrl: './realizar-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealizarVisitaComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly etiquetasSeccion: Record<string, string> = {
    personal_info: 'Información personal',
    personal_data: 'Datos personales',
    family_members: 'Familiares',
    residences: 'Domicilios',
    vehicles: 'Vehículos',
    assets_liabilities: 'Activos y pasivos',
    employments: 'Empleos',
    commercial_credits: 'Créditos comerciales',
  };

  step = signal(1);
  puntosComprobacion = signal<PuntoComprobacion[]>([]);
  seccionesDiferencias: { id: string; label: string }[] = [];
  camposDiferencias: Record<string, CampoDeclarado[]> = {};
  mostrarEditorDiferencia = signal(false);
  observacionesFila = signal('');
  resultadoFinal = signal<'FAVORABLE' | 'UNFAVORABLE' | null>(null);

  readonly tiposEvidencia = [
    { id: 'RESIDENCE_EXTERIOR', label: 'Exterior del domicilio' },
    { id: 'RESIDENCE_INTERIOR', label: 'Interior del domicilio' },
    { id: 'IDENTIFICATION_EVIDENCE', label: 'Identificación' },
    { id: 'VEHICLE_EVIDENCE', label: 'Vehículo' },
    { id: 'ASSET_EVIDENCE', label: 'Activo' },
    { id: 'COMMERCIAL_EVIDENCE', label: 'Información comercial' },
    { id: 'OTHER', label: 'Otra evidencia' },
  ];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    await this.facade.cargarVisita(id);
    this.prepararDatosDeclarados();
  }

  ngOnDestroy(): void {
    this.facade.limpiarSeleccion();
  }

  private prepararDatosDeclarados(): void {
    const solicitud = this.facade.solicitudSeleccionada();
    const visita = this.facade.visitaSeleccionada();
    if (!solicitud || !visita) return;

    this.seccionesDiferencias = [];
    const camposPorSeccion: Record<string, CampoDeclarado[]> = {};
    for (const [seccion, etiqueta] of Object.entries(this.etiquetasSeccion)) {
      const valor = solicitud.datosDeclarados[seccion];
      const campos = this.extraerCampos(valor);
      if (campos.length > 0) {
        camposPorSeccion[seccion] = campos;
        this.seccionesDiferencias.push({ id: seccion, label: etiqueta });
      }
    }

    this.camposDiferencias = camposPorSeccion;
    this.puntosComprobacion.set(
      Object.entries(camposPorSeccion).flatMap(([seccion, campos]) =>
        campos.map((campo) => {
          const diferencia = visita.diferencias.find(
            (actual) => actual.seccion === seccion && actual.campo === campo.id,
          );

          return {
            id: `${seccion}.${campo.id}`,
            seccion,
            campo: campo.id,
            etiqueta: campo.label,
            datoDeclarado: campo.valorOriginal,
            estado: diferencia ? 'DIFERENCIA' : null,
            diferenciaRegistrada: Boolean(diferencia),
          };
        }),
      ),
    );
  }

  private extraerCampos(valor: unknown, prefijo = ''): CampoDeclarado[] {
    if (Array.isArray(valor)) {
      return valor.flatMap((elemento, indice) =>
        this.extraerCampos(elemento, prefijo ? `${prefijo}.${indice}` : `${indice}`),
      );
    }

    if (valor !== null && typeof valor === 'object') {
      return Object.entries(valor as Record<string, unknown>).flatMap(([campo, dato]) =>
        this.extraerCampos(dato, prefijo ? `${prefijo}.${campo}` : campo),
      );
    }

    if (!prefijo) return [];

    return [{ id: prefijo, label: prefijo.replaceAll('_', ' '), valorOriginal: valor }];
  }

  async iniciarVisita(): Promise<void> {
    const visita = this.facade.visitaSeleccionada();
    if (visita?.estado === 'ASSIGNED') {
      await this.facade.iniciarVisita(visita.id, { lock_version: visita.lockVersion });
    }
  }

  onEstadoPuntoChange(event: {
    puntoId: string;
    estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA';
  }): void {
    this.puntosComprobacion.update((puntos) =>
      puntos.map((punto) =>
        punto.id === event.puntoId ? { ...punto, estado: event.estado } : punto,
      ),
    );
  }

  abrirEditorDiferencia(_punto?: PuntoComprobacion): void {
    this.mostrarEditorDiferencia.set(true);
  }

  cerrarEditorDiferencia(): void {
    this.mostrarEditorDiferencia.set(false);
  }

  async onGuardarDiferencia(diferencia: DiferenciaPayload): Promise<void> {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const diferenciasActuales = visita.diferencias
      .filter(
        (actual) => actual.seccion !== diferencia.seccion || actual.campo !== diferencia.campo,
      )
      .map((actual) => ({
        seccion: actual.seccion,
        campo: actual.campo,
        dato_declarado: actual.datoDeclarado,
        dato_observado: actual.datoObservado,
        descripcion: actual.descripcion,
      }));

    const success = await this.facade.actualizarVisita(visita.id, {
      diferencias: [
        ...diferenciasActuales,
        {
          seccion: diferencia.seccion,
          campo: diferencia.campo,
          dato_declarado: diferencia.datoDeclarado,
          dato_observado: diferencia.datoObservado,
          descripcion: diferencia.descripcion,
        },
      ],
      lock_version: visita.lockVersion,
    });

    if (success) {
      this.cerrarEditorDiferencia();
      this.prepararDatosDeclarados();
    }
  }

  async onSubirEvidencia(payload: { tipo: string; file: File }): Promise<void> {
    const visita = this.facade.visitaSeleccionada();
    if (visita) {
      await this.facade.adjuntarEvidencia(
        visita.id,
        payload.tipo,
        payload.file,
        visita.lockVersion,
      );
    }
  }

  async onEliminarEvidencia(evidenciaId: string): Promise<void> {
    const visita = this.facade.visitaSeleccionada();
    if (visita) {
      await this.facade.eliminarEvidencia(visita.id, evidenciaId, visita.lockVersion);
    }
  }

  async onDescargarEvidencia(evidenciaId: string): Promise<void> {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const blob = await this.facade.descargarEvidenciaBlob(visita.id, evidenciaId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `evidencia-${evidenciaId}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async finalizarVisita(): Promise<void> {
    let visita = this.facade.visitaSeleccionada();
    const resultado = this.resultadoFinal();
    if (!visita || !resultado) {
      alert('Debes seleccionar un resultado final.');
      return;
    }

    if (resultado === 'UNFAVORABLE' && !this.observacionesFila().trim()) {
      alert('Debes incluir observaciones si el resultado es desfavorable.');
      return;
    }

    const diferenciaPendiente = this.puntosComprobacion().some(
      (punto) => punto.estado === 'DIFERENCIA' && !punto.diferenciaRegistrada,
    );
    if (diferenciaPendiente) {
      alert('Registra todas las diferencias marcadas antes de finalizar.');
      return;
    }

    if (!confirm('¿Estás seguro de finalizar la visita? Esta acción es irreversible.')) return;

    const comparacionGuardada = await this.facade.actualizarVisita(visita.id, {
      observaciones_generales: this.observacionesFila().trim(),
      diferencias: visita.diferencias.map((diferencia) => ({
        seccion: diferencia.seccion,
        campo: diferencia.campo,
        dato_declarado: diferencia.datoDeclarado,
        dato_observado: diferencia.datoObservado,
        descripcion: diferencia.descripcion,
      })),
      lock_version: visita.lockVersion,
    });
    if (!comparacionGuardada) return;

    visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const success = await this.facade.finalizarVisita(visita.id, {
      resultado_fisico: resultado,
      observaciones: this.observacionesFila().trim(),
      lock_version: visita.lockVersion,
    });

    if (success) {
      alert('Visita finalizada con éxito.');
      await this.router.navigate(['/verificacion-distribuidoras/verificaciones/asignadas']);
    }
  }

  setStep(step: number): void {
    this.step.set(step);
  }
}
