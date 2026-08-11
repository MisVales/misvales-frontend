import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ListaComprobacionVisitaComponent, PuntoComprobacion } from '../../components/lista-comprobacion-visita/lista-comprobacion-visita.component';
import { CapturaEvidenciaComponent } from '../../components/captura-evidencia/captura-evidencia.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { EditorDiferenciasComponent, DiferenciaPayload } from '../../components/editor-diferencias/editor-diferencias.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-realizar-visita',
  standalone: true,
  imports: [
    ListaComprobacionVisitaComponent, 
    CapturaEvidenciaComponent, 
    GaleriaEvidenciasComponent, 
    EditorDiferenciasComponent,
    FormsModule
  ],
  templateUrl: './realizar-visita.component.html',
  styleUrl: './realizar-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealizarVisitaComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Tabs / Wizard steps
  step = signal<number>(1);
  
  puntosComprobacion = signal<PuntoComprobacion[]>([]);

  tiposEvidencia = [
    { id: 'FACHADA', label: 'Fotografía de Fachada' },
    { id: 'INTERIOR', label: 'Fotografía de Interior' },
    { id: 'DOCUMENTO', label: 'Fotografía de Documento' },
  ];

  seccionesDiferencias: { id: string; label: string }[] = [];
  camposDiferencias: Record<string, { id: string; label: string; valorOriginal: string }[]> = {};

  mostrarEditorDiferencia = signal<boolean>(false);
  
  observacionesFila = signal<string>('');
  resultadoFinal = signal<'FAVORABLE' | 'UNFAVORABLE' | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.facade.cargarVisita(id);
      const visita = this.facade.visitaSeleccionada();
      if (visita) {
        await this.facade.cargarSolicitud(visita.solicitudId);
        this.construirComprobacion();
      }
    }
  }

  private construirComprobacion() {
    const datos = this.facade.solicitudSeleccionada()?.datosDeclarados ?? {};
    const puntos: PuntoComprobacion[] = [];
    const campos: Record<string, { id: string; label: string; valorOriginal: string }[]> = {};
    for (const [seccion, contenido] of Object.entries(datos)) {
      if (contenido === null || (Array.isArray(contenido) && contenido.length === 0)) continue;
      const registros = Array.isArray(contenido) ? contenido : [contenido];
      campos[seccion] = [];
      registros.forEach((registro, indice) => {
        if (!registro || typeof registro !== 'object') return;
        Object.entries(registro as Record<string, unknown>).forEach(([campo, valor]) => {
          if (['id', 'application_id', 'created_at', 'updated_at', 'lock_version'].includes(campo)) return;
          const id = `${seccion}.${indice}.${campo}`;
          const declarado = valor == null ? 'Sin dato' : typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
          puntos.push({ id, seccion, campo, etiqueta: campo.replaceAll('_', ' '), datoDeclarado: declarado, estado: null });
          campos[seccion].push({ id: campo, label: campo.replaceAll('_', ' '), valorOriginal: declarado });
        });
      });
    }
    this.puntosComprobacion.set(puntos);
    this.camposDiferencias = campos;
    this.seccionesDiferencias = Object.keys(campos).map(id => ({ id, label: id.replaceAll('_', ' ') }));
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  async iniciarVisita() {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;
    
    if (visita.estado === 'ASSIGNED') {
      await this.facade.iniciarVisita(visita.id, { lock_version: visita.lockVersion });
    }
  }

  onEstadoPuntoChange(event: { puntoId: string; estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA' }) {
    this.puntosComprobacion.update(pts => 
      pts.map(p => p.id === event.puntoId ? { ...p, estado: event.estado } : p)
    );
  }

  abrirEditorDiferencia(punto?: PuntoComprobacion) {
    this.mostrarEditorDiferencia.set(true);
    // Podríamos pre-llenar el editor si viene de un punto específico
  }

  cerrarEditorDiferencia() {
    this.mostrarEditorDiferencia.set(false);
  }

  async onGuardarDiferencia(diferencia: DiferenciaPayload) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    // Actualizar la visita agregando la diferencia
    const nuevasDiferencias = [
      ...visita.diferencias.map(d => ({
        seccion: d.seccion,
        campo: d.campo,
        dato_declarado: d.datoDeclarado,
        dato_observado: d.datoObservado,
        descripcion: d.descripcion
      })),
      {
        seccion: diferencia.seccion,
        campo: diferencia.campo,
        dato_declarado: diferencia.datoDeclarado,
        dato_observado: diferencia.datoObservado,
        descripcion: diferencia.descripcion
      }
    ];

    const success = await this.facade.actualizarVisita(visita.id, {
      diferencias: nuevasDiferencias,
      lock_version: visita.lockVersion
    });

    if (success) {
      this.cerrarEditorDiferencia();
      
      // Marcar el punto como registrado si aplica
      this.puntosComprobacion.update(pts => 
        pts.map(p => p.seccion === diferencia.seccion && p.campo === diferencia.campo 
          ? { ...p, diferenciaRegistrada: true } 
          : p)
      );
    }
  }

  async onSubirEvidencia(payload: { tipo: string; file: File }) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;
    await this.facade.adjuntarEvidencia(visita.id, payload.tipo, payload.file, visita.lockVersion);
  }

  async onEliminarEvidencia(evidenciaId: string) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;
    await this.facade.eliminarEvidencia(visita.id, evidenciaId, visita.lockVersion);
  }

  async onDescargarEvidencia(evidenciaId: string) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;
    const blob = await this.facade.descargarEvidenciaBlob(visita.id, evidenciaId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidencia-${evidenciaId}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async finalizarVisita() {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    if (!this.resultadoFinal()) {
      alert('Debes seleccionar un resultado final.');
      return;
    }

    if (this.resultadoFinal() === 'UNFAVORABLE' && !this.observacionesFila()) {
      alert('Debes incluir observaciones si el resultado es desfavorable.');
      return;
    }

    if (confirm('¿Estás seguro de finalizar la visita? Esta acción es irreversible.')) {
      const success = await this.facade.finalizarVisita(visita.id, {
        resultado_fisico: this.resultadoFinal()!,
        observaciones: this.observacionesFila(),
        lock_version: visita.lockVersion
      });

      if (success) {
        // En una app real, mostrar mensaje de éxito y navegar
        alert('Visita finalizada con éxito.');
        this.router.navigate(['/verificacion-distribuidoras/verificaciones/asignadas']);
      }
    }
  }

  setStep(s: number) {
    this.step.set(s);
  }
}
