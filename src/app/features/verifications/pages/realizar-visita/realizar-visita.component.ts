import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ListaComprobacionVisitaComponent, PuntoComprobacion } from '../../components/lista-comprobacion-visita/lista-comprobacion-visita.component';
import { CapturaEvidenciaComponent } from '../../components/captura-evidencia/captura-evidencia.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { EditorDiferenciasComponent, DiferenciaPayload, DiferenciaRelacionada, DireccionContexto } from '../../components/editor-diferencias/editor-diferencias.component';
import { AddressResult } from '../../../../shared/components/inputs/address-form/address-form';
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
        const registroDatos = registro as Record<string, unknown>;
        const registroId = typeof registroDatos['id'] === 'string' ? String(registroDatos['id']) : undefined;
        const direccionDeclarada = this.direccionDesdeRegistro(registroDatos);
        const diferenciasDireccion = diferencias.filter((item) =>
          item.seccion === seccion
          && CAMPOS_DIRECCION.has(item.campo)
          && (!item.registroId || item.registroId === registroId),
        );
        if (seccion === 'residences' && Object.keys(direccionDeclarada).length > 0) {
          const direccionObservada = diferenciasDireccion.length > 0
            ? this.combinarDireccionObservada(direccionDeclarada, diferenciasDireccion)
            : undefined;
          const descripciones = [...new Set(diferenciasDireccion.map((item) => item.descripcion).filter(Boolean))];
          puntos.push({
            id: `${seccion}.${indice}.address`,
            seccion,
            campo: 'address',
            etiqueta: 'Domicilio completo',
            datoDeclarado: this.formatearDomicilio(direccionDeclarada),
            datoObservado: direccionObservada ? this.formatearDomicilio(direccionObservada) : undefined,
            descripcion: descripciones.join(' · ') || undefined,
            grupo: ETIQUETAS_SECCIONES[seccion] ?? this.humanizar(seccion),
            registro: this.etiquetaRegistro(seccion, registroDatos, indice),
            registroId,
            estado: diferenciasDireccion.length > 0 ? 'DIFERENCIA' : 'COMPROBADO',
            diferenciaRegistrada: diferenciasDireccion.length > 0,
            direccionDeclarada,
            direccionObservada,
          });
        }

        Object.entries(registroDatos).forEach(([campo, valor]) => {
          if (CAMPOS_INTERNOS.has(campo) || (seccion === 'residences' && CAMPOS_DIRECCION.has(campo))) return;
          const id = `${seccion}.${indice}.${campo}`;
          const diferencia = diferencias.find((item) =>
            item.seccion === seccion
            && item.campo === campo
            && (!item.registroId || item.registroId === registroId)
          );
          const declarado = this.formatearValor(campo, valor);
          puntos.push({
            id,
            seccion,
            campo,
            etiqueta: ETIQUETAS_CAMPOS[campo] ?? this.humanizar(campo),
            datoDeclarado: declarado,
            datoObservado: diferencia ? this.formatearValor(campo, diferencia.datoObservado) : undefined,
            descripcion: diferencia?.descripcion,
            grupo: ETIQUETAS_SECCIONES[seccion] ?? this.humanizar(seccion),
            registro: this.etiquetaRegistro(seccion, registroDatos, indice),
            registroId,
            estado: diferencias.some((diferencia) =>
              diferencia.seccion === seccion
              && diferencia.campo === campo
              && (!diferencia.registroId || diferencia.registroId === registroId)
            ) ? 'DIFERENCIA' : 'COMPROBADO',
            diferenciaRegistrada: diferencias.some((diferencia) =>
              diferencia.seccion === seccion
              && diferencia.campo === campo
              && (!diferencia.registroId || diferencia.registroId === registroId)
            ),
          });
        });
      });
    }
    this.puntosComprobacion.set(puntos);
  }

  private direccionDesdeRegistro(registro: Record<string, unknown>): Partial<AddressResult> {
    const direccion: Partial<AddressResult> = {
      street: this.texto(registro['street']),
      exterior_number: this.texto(registro['exterior_number']),
      interior_number: this.texto(registro['interior_number']),
      neighborhood: this.texto(registro['neighborhood']),
      zip_code: this.texto(registro['postal_code']),
      municipality: this.texto(registro['municipality']),
      city: this.texto(registro['city']),
      state: this.texto(registro['state']),
      country: this.texto(registro['country']),
    };
    return Object.fromEntries(Object.entries(direccion).filter(([, value]) => value)) as Partial<AddressResult>;
  }

  private combinarDireccionObservada(
    declarada: Partial<AddressResult>,
    diferencias: Array<{ campo: string; datoObservado: string }>,
  ): Partial<AddressResult> {
    return diferencias.reduce<Partial<AddressResult>>((direccion, diferencia) => ({
      ...direccion,
      [this.propiedadDireccion(diferencia.campo)]: diferencia.datoObservado,
    }), { ...declarada });
  }

  private propiedadDireccion(campo: string): keyof AddressResult {
    return campo === 'postal_code' ? 'zip_code' : campo as keyof AddressResult;
  }

  private formatearDomicilio(direccion: Partial<AddressResult>): string {
    const linea = [direccion.street, direccion.exterior_number, direccion.interior_number ? `Int. ${direccion.interior_number}` : '']
      .filter(Boolean)
      .join(' ');
    const ubicacion = [direccion.neighborhood ? `Col. ${direccion.neighborhood}` : '', direccion.municipality || direccion.city, direccion.state]
      .filter(Boolean)
      .join(', ');
    const cp = direccion.zip_code ? `C.P. ${direccion.zip_code}` : '';
    return [linea, ubicacion, cp].filter(Boolean).join(' · ');
  }

  private valorCampoDireccion(direccion: Partial<AddressResult> | undefined, campo: string): string {
    if (!direccion) return '';
    const values: Record<string, unknown> = {
      street: direccion.street,
      exterior_number: direccion.exterior_number,
      interior_number: direccion.interior_number,
      neighborhood: direccion.neighborhood,
      postal_code: direccion.zip_code,
      municipality: direccion.municipality,
      city: direccion.city,
      state: direccion.state,
      country: direccion.country,
    };
    return this.texto(values[campo]);
  }

  private texto(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
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

  readonly etiquetasSecciones = ETIQUETAS_SECCIONES;
  readonly etiquetasCampos = ETIQUETAS_CAMPOS;

  formatearValor(campo: string, valor: unknown): string {
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

  humanizar(valor: string): string {
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
    const visita = this.facade.visitaSeleccionada();
    const dif = visita?.diferencias.find(
      (d) => d.seccion === punto.seccion && d.campo === punto.campo && (!d.registroId || d.registroId === punto.registroId)
    );
    const diferenciasDireccion = punto.campo === 'address'
      ? (visita?.diferencias ?? []).filter((difference) =>
        difference.seccion === punto.seccion
        && CAMPOS_DIRECCION.has(difference.campo)
        && (!difference.registroId || difference.registroId === punto.registroId),
      )
      : [];
    const relacionadas: DiferenciaRelacionada[] = punto.campo === 'nationality'
      ? this.puntosComprobacion()
        .filter((item) => item.seccion === punto.seccion && item.registroId === punto.registroId && ['birth_country', 'identification_country'].includes(item.campo))
        .map((item) => {
          const relatedDifference = this.facade.visitaSeleccionada()?.diferencias.find(
            (difference) => difference.seccion === item.seccion && difference.campo === item.campo && (!difference.registroId || difference.registroId === item.registroId),
          );
          return {
            campo: item.campo,
            etiqueta: item.etiqueta,
            datoDeclarado: item.datoDeclarado,
            datoObservado: relatedDifference?.datoObservado ?? '',
          };
        })
      : [];
    const direccion: DireccionContexto | undefined = punto.campo === 'address'
      ? {
        declarada: punto.direccionDeclarada ?? {},
        observada: punto.direccionObservada,
        campos: [...CAMPOS_DIRECCION].map((campo) => ({
          campo,
          etiqueta: ETIQUETAS_CAMPOS[campo] ?? this.humanizar(campo),
          datoDeclarado: this.valorCampoDireccion(punto.direccionDeclarada, campo),
          datoObservado: diferenciasDireccion.find((difference) => difference.campo === campo)?.datoObservado,
        })),
      }
      : undefined;
    return {
      seccion: punto.seccion,
      campo: punto.campo,
      etiqueta: punto.grupo + ' · ' + punto.etiqueta,
      datoDeclarado: punto.datoDeclarado,
      datoObservado: punto.campo === 'address' ? punto.datoObservado || '' : dif?.datoObservado || '',
      descripcion: punto.campo === 'address' ? punto.descripcion || '' : dif?.descripcion || '',
      relacionadas,
      direccion,
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

  async onGuardarDiferencia(payload: DiferenciaPayload | DiferenciaPayload[]) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const punto = this.puntoDiferencia();
    const diferencias = Array.isArray(payload) ? payload : [payload];
    const keys = new Set(diferencias.map((diferencia) => `${diferencia.seccion}|${diferencia.campo}`));
    const registroId = punto?.registroId;
    const registroNombre = punto?.registro;
    const esDireccion = punto?.campo === 'address';

    // Filter out previous difference for this specific field to allow editing without duplicates
    const diferenciasFiltradas = visita.diferencias.filter(
      (d) => {
        const mismoRegistro = !d.registroId || d.registroId === registroId;
        if (esDireccion && d.seccion === punto?.seccion && CAMPOS_DIRECCION.has(d.campo) && mismoRegistro) {
          return false;
        }
        return !(keys.has(`${d.seccion}|${d.campo}`) && mismoRegistro);
      },
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
      ...diferencias.map((diferencia) => ({
        seccion: diferencia.seccion,
        campo: diferencia.campo,
        dato_declarado: diferencia.datoDeclarado,
        dato_observado: diferencia.datoObservado,
        descripcion: diferencia.descripcion,
        registro_id: registroId,
        registro_nombre: registroNombre,
      }))
    ];

    const success = await this.facade.actualizarVisita(visita.id, {
      diferencias: nuevasDiferencias,
      lock_version: visita.lockVersion
    });

    if (success) {
      if (punto) {
        this.puntosComprobacion.update((puntos) => puntos.map((item) => {
          if (esDireccion && item.id === punto.id) {
            const diferenciasDireccion = diferencias.filter((diferencia) => CAMPOS_DIRECCION.has(diferencia.campo));
            const direccionObservada = this.combinarDireccionObservada(punto.direccionDeclarada ?? {}, diferenciasDireccion);
            return {
              ...item,
              estado: diferenciasDireccion.length > 0 ? 'DIFERENCIA' : 'COMPROBADO',
              diferenciaRegistrada: diferenciasDireccion.length > 0,
              datoObservado: diferenciasDireccion.length > 0 ? this.formatearDomicilio(direccionObservada) : undefined,
              descripcion: [...new Set(diferenciasDireccion.map((diferencia) => diferencia.descripcion).filter(Boolean))].join(' · ') || undefined,
              direccionObservada: diferenciasDireccion.length > 0 ? direccionObservada : undefined,
            };
          }
          const cambio = diferencias.find((diferencia) => diferencia.seccion === item.seccion && diferencia.campo === item.campo && item.registroId === registroId);
          return cambio
            ? { ...item, estado: 'DIFERENCIA', diferenciaRegistrada: true, datoObservado: this.formatearValor(item.campo, cambio.datoObservado), descripcion: cambio.descripcion }
            : item;
        }));
      }
      this.alerts.showAlert('Diferencia guardada exitosamente.', 'success');
      this.cerrarEditorDiferencia();
    }
  }

  async onEliminarDiferencia(punto: PuntoComprobacion) {
    const visita = this.facade.visitaSeleccionada();
    if (!visita) return;

    const camposAEliminar = new Set([
      punto.campo,
      ...(punto.campo === 'address' ? [...CAMPOS_DIRECCION] : []),
      ...(punto.campo === 'nationality' ? ['birth_country', 'identification_country'] : []),
    ]);
    const nuevasDiferencias = visita.diferencias
      .filter((d) => !(d.seccion === punto.seccion && camposAEliminar.has(d.campo) && (!d.registroId || d.registroId === punto.registroId)))
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
      this.puntosComprobacion.update((puntos) => puntos.map((item) =>
        item.seccion === punto.seccion && camposAEliminar.has(item.campo) && item.registroId === punto.registroId
          ? { ...item, estado: 'COMPROBADO', diferenciaRegistrada: false, datoObservado: undefined, descripcion: undefined, direccionObservada: undefined }
          : item,
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

const CAMPOS_DIRECCION = new Set([
  'street', 'exterior_number', 'interior_number', 'neighborhood', 'postal_code',
  'municipality', 'city', 'state', 'country',
]);

const CAMPOS_INTERNOS = new Set([
  'id', 'application_id', 'created_at', 'updated_at', 'lock_version', 'details_payload', 'reference_payload',
  'is_current', 'is_active', 'declared_age', 'entry_type', 'is_family_reference',
  'has_identification_evidence', 'birth_place',
  'school_name', 'school',
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
  official_id_number_masked: 'Número de identificación', official_id_number: 'Número de identificación', relationship: 'Parentesco', street: 'Calle',
  exterior_number: 'Número exterior', interior_number: 'Número interior', neighborhood: 'Colonia', postal_code: 'Código postal',
  municipality: 'Municipio', city: 'Ciudad', state: 'Estado', country: 'País', housing_tenure: 'Tipo de vivienda',
  financing_status: 'Financiamiento', width_meters: 'Frente', length_meters: 'Fondo', built_area_square_meters: 'Área construida',
  vehicle_type: 'Tipo de vehículo', brand: 'Marca', model: 'Modelo', model_year: 'Año', ownership_status: 'Propiedad',
  entry_type: 'Tipo de registro', name: 'Nombre', amount: 'Monto', outstanding_balance: 'Saldo pendiente', monthly_payment: 'Pago mensual',
  employer_name: 'Empresa', job_title: 'Puesto', started_at: 'Fecha de inicio', ended_at: 'Fecha de término',
  company_name: 'Institución', credit_limit: 'Límite de crédito', proof_reference: 'Referencia del comprobante',
};

const VALORES_TRADUCIDOS: Record<string, string> = {
  // Nacionalidad y Países
  MEXICAN: 'Mexicana', FOREIGN: 'Extranjera', MX: 'México', US: 'Estados Unidos', HT: 'Haití',
  CO: 'Colombia', VE: 'Venezuela', GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
  // Documentos
  INE: 'Credencial para votar (INE)', PASSPORT: 'Pasaporte', PROFESSIONAL_LICENSE: 'Cédula Profesional', OTHER: 'Otro',
  // Parentescos
  SPOUSE: 'Esposo(a)', PARTNER: 'Pareja', CHILD: 'Hijo(a)', FATHER: 'Padre', MOTHER: 'Madre', SIBLING: 'Hermano(a)',
  // Domicilio - Tenencia
  OWNED: 'Propia', RENTED: 'Rentada', BORROWED: 'Prestada',
  // Domicilio - Financiamiento
  PAID: 'Pagada', MORTGAGE: 'Hipotecada', LOAN: 'Préstamo', INFONAVIT: 'INFONAVIT', NOT_APPLICABLE: 'No Aplica',
  // Vehículos
  AUTOMOBILE: 'Automóvil', MOTORCYCLE: 'Motocicleta', TRUCK: 'Camioneta / Camión',
  FINANCED: 'Financiado', COMPANY: 'De empresa',
  // Patrimonio
  ASSET: 'Bien', LIABILITY: 'Deuda', ACTIVE_COMMITMENT: 'Compromiso activo',
  // Créditos
  CARTA: 'Carta', ESTADO_DE_CUENTA: 'Estado de cuenta',
  // Booleanos
  true: 'Sí', false: 'No',
};
