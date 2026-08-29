import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ListaComprobacionVisitaComponent, PuntoComprobacion } from '../../components/lista-comprobacion-visita/lista-comprobacion-visita.component';
import { CapturaEvidenciaComponent } from '../../components/captura-evidencia/captura-evidencia.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { EditorDiferenciasComponent, DiferenciaPayload } from '../../components/editor-diferencias/editor-diferencias.component';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { firstValueFrom } from 'rxjs';
import {
  ObservationPanelComponent,
  VerificationDecisionGroupComponent,
} from '../../presentation/components/verification/verification-workflow';
import { DecisionOption } from '../../presentation/models/verification.models';
import { canStartScheduledVisit } from '../../utils/visit-schedule-policy';

export type SeccionVisita =
  | 'datos_personales'
  | 'familiares'
  | 'domicilios'
  | 'vehiculos'
  | 'patrimonio'
  | 'empleos'
  | 'creditos'
  | 'evidencias_visita'
  | 'resultado_final';

export interface PasoVisita {
  id: SeccionVisita;
  label: string;
  seccionClave?: string;
  grupoNombre?: string;
  evidenciaPurpose?: string;
}

@Component({
  selector: 'app-realizar-visita',
  standalone: true,
  imports: [
    CommonModule,
    ListaComprobacionVisitaComponent, 
    CapturaEvidenciaComponent, 
    GaleriaEvidenciasComponent, 
    EditorDiferenciasComponent,
    ObservationPanelComponent,
    VerificationDecisionGroupComponent,
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
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly mediaApi = inject(MediaApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly pasos: PasoVisita[] = [
    { id: 'datos_personales', label: 'Datos Personales', seccionClave: 'personal_data', grupoNombre: 'Datos personales', evidenciaPurpose: 'IDENTIFICATION' },
    { id: 'familiares', label: 'Familiares', seccionClave: 'family_members', grupoNombre: 'Familiares' },
    { id: 'domicilios', label: 'Domicilios', seccionClave: 'residences', grupoNombre: 'Domicilios', evidenciaPurpose: 'ADDRESS_PROOF' },
    { id: 'vehiculos', label: 'Vehículos', seccionClave: 'vehicles', grupoNombre: 'Vehículos', evidenciaPurpose: 'VEHICLE_EVIDENCE' },
    { id: 'patrimonio', label: 'Patrimonio', seccionClave: 'assets_liabilities', grupoNombre: 'Patrimonio', evidenciaPurpose: 'ASSET_EVIDENCE' },
    { id: 'empleos', label: 'Empleos', seccionClave: 'employments', grupoNombre: 'Empleos' },
    { id: 'creditos', label: 'Créditos', seccionClave: 'commercial_credits', grupoNombre: 'Créditos comerciales', evidenciaPurpose: 'COMMERCIAL_EVIDENCE' },
    { id: 'evidencias_visita', label: 'Evidencias de Visita' },
    { id: 'resultado_final', label: 'Resultado Final' },
  ];

  pasoActual = signal<SeccionVisita>('datos_personales');
  
  puntosComprobacion = signal<PuntoComprobacion[]>([]);

  tiposEvidencia = [
    { id: 'FACHADA', label: 'Fotografía de Fachada' },
    { id: 'INTERIOR', label: 'Fotografía de Interior' },
    { id: 'DOCUMENTO', label: 'Fotografía de Documento' },
  ];

  tiposEvidenciaDeclarada = [
    { id: 'IDENTIFICATION', label: 'Identificación oficial' },
    { id: 'ADDRESS_PROOF', label: 'Comprobante de domicilio' },
    { id: 'VEHICLE_EVIDENCE', label: 'Evidencia de vehículo' },
    { id: 'ASSET_EVIDENCE', label: 'Evidencia patrimonial' },
    { id: 'COMMERCIAL_EVIDENCE', label: 'Evidencia de crédito comercial' },
  ];

  mostrarEditorDiferencia = signal<boolean>(false);
  puntoDiferencia = signal<PuntoComprobacion | null>(null);
  
  observacionesFila = signal<string>('');
  resultadoFinal = signal<'FAVORABLE' | 'UNFAVORABLE' | null>(null);
  submittedFinal = signal<boolean>(false);
  readonly resultadoOptions: readonly DecisionOption[] = [
    {
      value: 'FAVORABLE',
      label: 'Favorable',
      description: 'La visita física coincide con la información comprobada.',
      icon: '✓',
      tone: 'favorable',
    },
    {
      value: 'UNFAVORABLE',
      label: 'Desfavorable',
      description: 'La visita requiere documentar hallazgos antes de enviarla a revisión.',
      icon: '!',
      tone: 'unfavorable',
    },
  ];

  // Puntos del paso actual
  puntosPasoActual = computed(() => {
    const paso = this.pasos.find((p) => p.id === this.pasoActual());
    if (!paso || !paso.grupoNombre) return [];
    return this.puntosComprobacion().filter((punto) => punto.grupo === paso.grupoNombre);
  });

  // Evidencias declaradas para el paso actual
  evidenciasDeclaradasPasoActual = computed(() => {
    const paso = this.pasos.find((p) => p.id === this.pasoActual());
    const visita = this.facade.visitaSeleccionada();
    if (!paso || !paso.evidenciaPurpose || !visita) return [];
    return visita.evidenciasDeclaradas.filter((e) => e.tipo === paso.evidenciaPurpose);
  });

  conteoDiferenciasPaso(paso: PasoVisita): number {
    if (!paso.grupoNombre) return 0;
    return this.puntosComprobacion().filter(
      (p) => p.grupo === paso.grupoNombre && p.estado === 'DIFERENCIA',
    ).length;
  }

  pasoCompletado(paso: PasoVisita): boolean {
    if (paso.id === 'evidencias_visita') {
      return (this.facade.visitaSeleccionada()?.evidencias.length ?? 0) > 0;
    }
    if (paso.id === 'resultado_final') {
      return !!this.resultadoFinal();
    }
    const puntos = this.puntosComprobacion().filter((p) => p.grupo === paso.grupoNombre);
    return puntos.length > 0 && puntos.every((p) => p.estado === 'COMPROBADO' || p.estado === 'DIFERENCIA');
  }

  cambiarPaso(pasoId: SeccionVisita) {
    this.pasoActual.set(pasoId);
  }

  pasoSiguiente() {
    const currentIndex = this.pasos.findIndex((p) => p.id === this.pasoActual());
    if (currentIndex < this.pasos.length - 1) {
      this.pasoActual.set(this.pasos[currentIndex + 1].id);
    }
  }

  pasoAnterior() {
    const currentIndex = this.pasos.findIndex((p) => p.id === this.pasoActual());
    if (currentIndex > 0) {
      this.pasoActual.set(this.pasos[currentIndex - 1].id);
    }
  }

  marcarTodoCorrectoPasoActualYContinuar() {
    const paso = this.pasos.find((p) => p.id === this.pasoActual());
    if (paso && paso.grupoNombre) {
      this.onEstadoGrupoChange({ grupo: paso.grupoNombre, estado: 'COMPROBADO' });
      this.alerts.showAlert(`Sección "${paso.label}" marcada como todo correcto.`, 'success');
      this.pasoSiguiente();
    }
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.facade.cargarVisita(id);
      const visita = this.facade.visitaSeleccionada();
      if (visita) {
        if (!this.facade.solicitudSeleccionada()) {
          await this.facade.cargarSolicitud(visita.solicitudId);
        }
        this.construirComprobacion();
        this.cdr.markForCheck();
      }
    }
  }

  private construirComprobacion() {
    const datos = this.facade.solicitudSeleccionada()?.datosDeclarados ?? {};
    const diferencias = this.facade.visitaSeleccionada()?.diferencias ?? [];
    const puntos: PuntoComprobacion[] = [];
    for (const [seccion, contenido] of Object.entries(datos)) {
      if (contenido === null || (Array.isArray(contenido) && contenido.length === 0)) continue;
      const registros = Array.isArray(contenido) ? contenido : [contenido];
      registros.forEach((registro, indice) => {
        if (!registro || typeof registro !== 'object') return;
        Object.entries(registro as Record<string, unknown>).forEach(([campo, valor]) => {
          if (CAMPOS_INTERNOS.has(campo)) return;
          const id = `${seccion}.${indice}.${campo}`;
          const declarado = this.formatearValor(campo, valor);
          puntos.push({
            id,
            seccion,
            campo,
            etiqueta: ETIQUETAS_CAMPOS[campo] ?? this.humanizar(campo),
            datoDeclarado: declarado,
            grupo: ETIQUETAS_SECCIONES[seccion] ?? this.humanizar(seccion),
            registro: this.etiquetaRegistro(seccion, registro as Record<string, unknown>, indice),
            registroId: typeof (registro as Record<string, unknown>)['id'] === 'string' ? String((registro as Record<string, unknown>)['id']) : undefined,
            estado: diferencias.some((diferencia) =>
              diferencia.seccion === seccion
              && diferencia.campo === campo
              && (!diferencia.registroId || diferencia.registroId === (registro as Record<string, unknown>)['id'])
            ) ? 'DIFERENCIA' : 'COMPROBADO',
            diferenciaRegistrada: diferencias.some((diferencia) =>
              diferencia.seccion === seccion
              && diferencia.campo === campo
              && (!diferencia.registroId || diferencia.registroId === (registro as Record<string, unknown>)['id'])
            ),
          });
        });
      });
    }
    this.puntosComprobacion.set(puntos);
  }

  private etiquetaRegistro(seccion: string, registro: Record<string, unknown>, indice: number): string {
    switch (seccion) {
      case 'family_members': return `Familiar ${indice + 1}${registro['relationship'] ? ` · ${this.formatearValor('relationship', registro['relationship'])}` : ''}`;
      case 'residences': return registro['is_current'] ? 'Domicilio actual' : `Domicilio anterior ${indice + 1}`;
      case 'vehicles': return `Vehículo ${indice + 1}${registro['brand'] || registro['model'] ? ` · ${[registro['brand'], registro['model']].filter(Boolean).join(' ')}` : ''}`;
      case 'assets_liabilities': return `${this.formatearValor('entry_type', registro['entry_type'])}${registro['name'] ? ` · ${String(registro['name'])}` : ''}`;
      case 'employments': return registro['is_current'] ? 'Empleo actual' : `Empleo anterior ${indice + 1}`;
      case 'commercial_credits': return `Crédito ${indice + 1}${registro['company_name'] ? ` · ${String(registro['company_name'])}` : ''}`;
      default: return '';
    }
  }

  private formatearValor(campo: string, valor: unknown): string {
    if (valor === null || valor === undefined || valor === '') return 'Sin dato';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    if (['birth_date', 'started_at', 'ended_at'].includes(campo) && typeof valor === 'string') {
      const [year, month, day] = valor.split('-');
      return year && month && day ? `${day}/${month}/${year}` : valor;
    }
    if (['amount', 'outstanding_balance', 'monthly_payment', 'credit_limit'].includes(campo)) {
      const numero = Number(valor);
      return Number.isFinite(numero) ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(numero) : String(valor);
    }
    if (campo === 'model_year') return String(valor);
    if (['width_meters', 'length_meters'].includes(campo)) return `${String(valor)} m`;
    if (campo === 'built_area_square_meters') return `${String(valor)} m²`;
    return VALORES_TRADUCIDOS[String(valor)] ?? String(valor);
  }

  private humanizar(valor: string): string {
    return valor.replaceAll('_', ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  etiquetaDiferencia(seccion: string, campo: string): string {
    const seccionHumana = ETIQUETAS_SECCIONES[seccion] ?? this.humanizar(seccion);
    const campoHumano = ETIQUETAS_CAMPOS[campo] ?? this.humanizar(campo);
    return `${seccionHumana} · ${campoHumano}`;
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  async iniciarVisita() {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;
    
    if (visita.estado === 'ASSIGNED') {
      if (!this.puedeIniciarVisita(visita.fechaProgramada)) {
        this.alerts.showAlert('La visita puede iniciarse desde 15 minutos antes de la hora programada o más tarde durante ese mismo día.', 'warning');
        return;
      }
      await this.facade.iniciarVisita(visita.id, { lock_version: visita.lockVersion });
    }
  }

  puedeIniciarVisita(fechaProgramada: string | null): boolean {
    return canStartScheduledVisit(fechaProgramada);
  }

  onEstadoPuntoChange(event: { puntoId: string; estado: 'COMPROBADO' | 'DIFERENCIA' | 'NO_APLICA' }) {
    this.puntosComprobacion.update(pts => 
      pts.map(p => p.id === event.puntoId ? { ...p, estado: event.estado } : p)
    );
  }

  onEstadoGrupoChange(event: { grupo: string; estado: 'COMPROBADO' | 'NO_APLICA' }) {
    this.puntosComprobacion.update((puntos) => puntos.map((punto) =>
      punto.grupo === event.grupo ? { ...punto, estado: event.estado } : punto
    ));
  }

  contextoEditor = computed(() => {
    const punto = this.puntoDiferencia();
    if (!punto) return null;
    const dif = this.facade.visitaSeleccionada()?.diferencias.find(
      (d) => d.seccion === punto.seccion && d.campo === punto.campo && (!d.registroId || d.registroId === punto.registroId)
    );
    return {
      seccion: punto.seccion,
      campo: punto.campo,
      etiqueta: punto.grupo + ' · ' + punto.etiqueta,
      datoDeclarado: punto.datoDeclarado,
      datoObservado: dif?.datoObservado || '',
      descripcion: dif?.descripcion || ''
    };
  });

  abrirEditorDiferencia(punto?: PuntoComprobacion) {
    if (!punto) return;
    this.puntoDiferencia.set(punto);
    this.mostrarEditorDiferencia.set(true);
  }

  cerrarEditorDiferencia() {
    this.mostrarEditorDiferencia.set(false);
    this.puntoDiferencia.set(null);
  }

  async onGuardarDiferencia(diferencia: DiferenciaPayload) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const punto = this.puntoDiferencia();
    const registroId = punto?.registroId;
    const registroNombre = punto?.registro;

    // Filter out previous difference for this specific field to allow editing without duplicates
    const diferenciasFiltradas = visita.diferencias.filter(
      (d) => !(d.seccion === diferencia.seccion && d.campo === diferencia.campo && (!d.registroId || d.registroId === registroId))
    );

    const nuevasDiferencias = [
      ...diferenciasFiltradas.map(d => ({
        seccion: d.seccion,
        campo: d.campo,
        dato_declarado: d.datoDeclarado,
        dato_observado: d.datoObservado,
        descripcion: d.descripcion,
        registro_id: d.registroId,
        registro_nombre: d.registroNombre
      })),
      {
        seccion: diferencia.seccion,
        campo: diferencia.campo,
        dato_declarado: diferencia.datoDeclarado,
        dato_observado: diferencia.datoObservado,
        descripcion: diferencia.descripcion,
        registro_id: registroId,
        registro_nombre: registroNombre
      }
    ];

    const success = await this.facade.actualizarVisita(visita.id, {
      diferencias: nuevasDiferencias,
      lock_version: visita.lockVersion
    });

    if (success) {
      if (punto) {
        this.puntosComprobacion.update((puntos) => puntos.map((item) => item.id === punto.id
          ? { ...item, estado: 'DIFERENCIA', diferenciaRegistrada: true }
          : item
        ));
      }
      this.alerts.showAlert('Diferencia guardada exitosamente.', 'success');
      this.cerrarEditorDiferencia();
    }
  }

  async onEliminarDiferencia(punto: PuntoComprobacion) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const nuevasDiferencias = visita.diferencias
      .filter((d) => !(d.seccion === punto.seccion && d.campo === punto.campo && (!d.registroId || d.registroId === punto.registroId)))
      .map((d) => ({
        seccion: d.seccion,
        campo: d.campo,
        dato_declarado: d.datoDeclarado,
        dato_observado: d.datoObservado,
        descripcion: d.descripcion,
        registro_id: d.registroId,
        registro_nombre: d.registroNombre
      }));

    const success = await this.facade.actualizarVisita(visita.id, {
      diferencias: nuevasDiferencias,
      lock_version: visita.lockVersion
    });

    if (success) {
      this.puntosComprobacion.update((puntos) => puntos.map((item) => item.id === punto.id
        ? { ...item, estado: 'COMPROBADO', diferenciaRegistrada: false }
        : item
      ));
      this.alerts.showAlert('Diferencia revertida; campo marcado como correcto.', 'info');
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

  async onDescargarEvidenciaDeclarada(evidenciaId: string) {
    try {
      const blob = await firstValueFrom(this.mediaApi.download(evidenciaId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidencia-declarada-${evidenciaId}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      this.alerts.showAlert('No fue posible descargar la evidencia declarada.', 'error');
    }
  }

  identificadorSolicitud(): string {
    const nombre = this.facade.solicitudSeleccionada()?.aspirante.nombreCompleto.trim();
    return nombre ? `Solicitud-${nombre.replace(/\s+/g, '')}` : 'Solicitud';
  }

  async finalizarVisita() {
    this.submittedFinal.set(true);
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    if (visita.evidencias.length === 0) {
      this.alerts.showAlert(
        'Debes capturar o subir al menos una fotografía de evidencia (fachada, interior o documento) en el paso "Evidencias de Visita" antes de finalizar.',
        'warning'
      );
      this.cambiarPaso('evidencias_visita');
      return;
    }

    if (!this.resultadoFinal()) {
      this.alerts.showAlert('Selecciona el resultado final de la visita.', 'warning');
      return;
    }

    if (this.resultadoFinal() === 'UNFAVORABLE' && !this.observacionesFila()) {
      this.alerts.showAlert('Incluye observaciones para documentar el resultado desfavorable.', 'warning');
      return;
    }

    if (await this.confirmation.confirm({ title: 'Finalizar visita', message: 'El checklist, las fotografías, las diferencias y el resultado quedarán cerrados para el verificador.', confirmLabel: 'Finalizar visita' })) {
      const success = await this.facade.finalizarVisita(visita.id, {
        resultado_fisico: this.resultadoFinal()!,
        observaciones: this.observacionesFila(),
        lock_version: visita.lockVersion
      });

      if (success) {
        this.alerts.showAlert('Visita finalizada y expediente enviado a revisión.', 'success');
        this.router.navigate(['/verificacion-distribuidoras/verificaciones/asignadas']);
      }
    }
  }
}

const CAMPOS_INTERNOS = new Set([
  'id', 'application_id', 'created_at', 'updated_at', 'lock_version', 'details_payload', 'reference_payload',
  'is_current', 'is_active', 'declared_age', 'relationship', 'entry_type', 'is_family_reference',
]);

const ETIQUETAS_SECCIONES: Record<string, string> = {
  personal_data: 'Datos personales', family_members: 'Familiares', residences: 'Domicilios', vehicles: 'Vehículos',
  assets_liabilities: 'Patrimonio', employments: 'Empleos', commercial_credits: 'Créditos comerciales',
};

const ETIQUETAS_CAMPOS: Record<string, string> = {
  first_name: 'Nombre(s)', first_last_name: 'Apellido paterno', second_last_name: 'Apellido materno', nationality: 'Nacionalidad',
  birth_country: 'País de nacimiento', curp_masked: 'CURP', curp: 'CURP', rfc_masked: 'RFC', rfc: 'RFC', birth_date: 'Fecha de nacimiento',
  birth_place: 'Lugar de nacimiento', birth_state: 'Estado de nacimiento', birth_city: 'Ciudad de nacimiento', email: 'Correo electrónico',
  phone_number: 'Teléfono', identification_country: 'País de emisión de identificación', official_id_type: 'Tipo de identificación',
  official_id_number_masked: 'Número de identificación', official_id_number: 'Número de identificación', relationship: 'Parentesco', school_name: 'Escuela', street: 'Calle',
  exterior_number: 'Número exterior', interior_number: 'Número interior', neighborhood: 'Colonia', postal_code: 'Código postal',
  municipality: 'Municipio', city: 'Ciudad', state: 'Estado', country: 'País', housing_tenure: 'Tipo de vivienda',
  financing_status: 'Financiamiento', width_meters: 'Frente', length_meters: 'Fondo', built_area_square_meters: 'Área construida',
  vehicle_type: 'Tipo de vehículo', brand: 'Marca', model: 'Modelo', model_year: 'Año', ownership_status: 'Propiedad',
  entry_type: 'Tipo de registro', name: 'Nombre', amount: 'Monto', outstanding_balance: 'Saldo pendiente', monthly_payment: 'Pago mensual',
  employer_name: 'Empresa', job_title: 'Puesto', started_at: 'Fecha de inicio', ended_at: 'Fecha de término',
  company_name: 'Institución', credit_limit: 'Límite de crédito', proof_reference: 'Referencia del comprobante',
};

const VALORES_TRADUCIDOS: Record<string, string> = {
  MEXICAN: 'Mexicana', MX: 'México', INE: 'Credencial para votar (INE)', SIBLING: 'Hermano/a', CHILD: 'Hijo/a',
  OWNED: 'Propio', RENTED: 'Rentada', INFONAVIT: 'INFONAVIT', ASSET: 'Bien', LIABILITY: 'Pasivo',
};
