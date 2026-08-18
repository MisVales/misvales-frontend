import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ListaComprobacionVisitaComponent, PuntoComprobacion } from '../../components/lista-comprobacion-visita/lista-comprobacion-visita.component';
import { CapturaEvidenciaComponent } from '../../components/captura-evidencia/captura-evidencia.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { EditorDiferenciasComponent, DiferenciaPayload } from '../../components/editor-diferencias/editor-diferencias.component';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

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
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);

  // Tabs / Wizard steps
  step = signal<number>(1);
  
  puntosComprobacion = signal<PuntoComprobacion[]>([]);

  tiposEvidencia = [
    { id: 'FACHADA', label: 'Fotografía de Fachada' },
    { id: 'INTERIOR', label: 'Fotografía de Interior' },
    { id: 'DOCUMENTO', label: 'Fotografía de Documento' },
  ];

  mostrarEditorDiferencia = signal<boolean>(false);
  puntoDiferencia = signal<PuntoComprobacion | null>(null);
  
  observacionesFila = signal<string>('');
  resultadoFinal = signal<'FAVORABLE' | 'UNFAVORABLE' | null>(null);

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
      }
    }
  }

  private construirComprobacion() {
    const datos = this.facade.solicitudSeleccionada()?.datosDeclarados ?? {};
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
            estado: null,
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
      await this.facade.iniciarVisita(visita.id, { lock_version: visita.lockVersion });
    }
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
      const punto = this.puntoDiferencia();
      if (punto) this.puntosComprobacion.update((puntos) => puntos.map((item) => item.id === punto.id
        ? { ...item, estado: 'DIFERENCIA', diferenciaRegistrada: true }
        : item
      ));
      this.cerrarEditorDiferencia();
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

  setStep(s: number) {
    this.step.set(s);
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
  birth_country: 'País de nacimiento', curp_masked: 'CURP', rfc_masked: 'RFC', birth_date: 'Fecha de nacimiento',
  birth_place: 'Lugar de nacimiento', birth_state: 'Estado de nacimiento', birth_city: 'Ciudad de nacimiento', email: 'Correo electrónico',
  phone_number: 'Teléfono', identification_country: 'País de emisión de identificación', official_id_type: 'Tipo de identificación',
  official_id_number_masked: 'Número de identificación', relationship: 'Parentesco', school_name: 'Escuela', street: 'Calle',
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
