import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ComparadorCorreccionesComponent } from '../../components/comparador-correcciones/comparador-correcciones.component';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

export interface PasoCorreccion {
  id: string;
  label: string;
}

@Component({
  selector: 'app-correcciones-solicitud',
  standalone: true,
  imports: [CommonModule, ComparadorCorreccionesComponent, FormsModule, RefactorSelectComponent],
  templateUrl: './correcciones-solicitud.component.html',
  styleUrl: './correcciones-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorreccionesSolicitudComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly pasos: PasoCorreccion[] = [
    { id: 'personal_data', label: 'Datos Personales' },
    { id: 'family_members', label: 'Familiares' },
    { id: 'residences', label: 'Domicilios' },
    { id: 'vehicles', label: 'Vehículos' },
    { id: 'assets_liabilities', label: 'Patrimonio' },
    { id: 'employments', label: 'Empleos' },
    { id: 'commercial_credits', label: 'Créditos' },
    { id: 'resumen', label: 'Resumen' },
  ];

  pasoActual = signal<string>('personal_data');

  mostrarFormularioCorreccion = signal<boolean>(false);
  diferenciaSeleccionada = signal<any>(null);

  // Form State for editing correction
  registroSeleccionado = signal<string>('');
  valorCorregido = signal<string>('');
  motivoCorreccion = signal<string>('');

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.facade.cargarSolicitud(id);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  // Diferencias pendientes en total
  diferenciasPendientes = computed(() => {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return [];

    const diferencias = solicitud.visitas.flatMap((v) => v.diferencias);
    return diferencias.filter(
      (d) => !solicitud.correcciones.some((c) => c.indiceDiferencia === d.indice),
    );
  });

  // Correcciones aplicadas en total
  correccionesAplicadas = computed(() => {
    return this.facade.solicitudSeleccionada()?.correcciones ?? [];
  });

  // Diferencias pendientes por sección / paso
  diferenciasPasoActual = computed(() => {
    const paso = this.pasoActual();
    if (paso === 'resumen') return [];
    return this.diferenciasPendientes().filter((d) => this.perteneceAPaso(d.seccion, paso));
  });

  // Correcciones aplicadas por sección / paso
  correccionesPasoActual = computed(() => {
    const paso = this.pasoActual();
    if (paso === 'resumen') return this.correccionesAplicadas();
    return this.correccionesAplicadas().filter((c) => this.perteneceAPaso(c.seccion, paso));
  });

  perteneceAPaso(seccion: string, pasoId: string): boolean {
    if (pasoId === 'personal_data') {
      return seccion === 'personal_data' || seccion === 'personal_info';
    }
    return seccion === pasoId;
  }

  conteoDiferenciasPaso(pasoId: string): number {
    if (pasoId === 'resumen') return 0;
    return this.diferenciasPendientes().filter((d) => this.perteneceAPaso(d.seccion, pasoId)).length;
  }

  conteoCorreccionesPaso(pasoId: string): number {
    if (pasoId === 'resumen') return this.correccionesAplicadas().length;
    return this.correccionesAplicadas().filter((c) => this.perteneceAPaso(c.seccion, pasoId)).length;
  }

  cambiarPaso(pasoId: string) {
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

  readonly paises = [
    { code: 'MX', name: 'México (MX)' },
    { code: 'US', name: 'Estados Unidos (US)' },
    { code: 'HT', name: 'Haití (HT)' },
    { code: 'CO', name: 'Colombia (CO)' },
    { code: 'VE', name: 'Venezuela (VE)' },
    { code: 'GT', name: 'Guatemala (GT)' },
    { code: 'HN', name: 'Honduras (HN)' },
    { code: 'SV', name: 'El Salvador (SV)' },
    { code: 'NI', name: 'Nicaragua (NI)' },
    { code: 'CU', name: 'Cuba (CU)' },
  ];

  abrirCorreccion(diferencia: any) {
    this.diferenciaSeleccionada.set(diferencia);
    this.registroSeleccionado.set(diferencia.registroId || '');
    let initialVal = diferencia.datoObservado ?? diferencia.datoDeclarado ?? '';
    if (this.isCountryField(diferencia.campo)) {
      if (['México', 'Mexicana', 'Mexico', 'MX'].includes(initialVal)) initialVal = 'MX';
      else if (['Haití', 'Haiti', 'HT'].includes(initialVal)) initialVal = 'HT';
      else if (['Estados Unidos', 'USA', 'US'].includes(initialVal)) initialVal = 'US';
    }
    if (this.isNationalityField(diferencia.campo)) {
      if (['Mexicana', 'Mexicano', 'México', 'MEXICAN'].includes(initialVal)) initialVal = 'MEXICAN';
      else if (['Extranjera', 'Extranjero', 'FOREIGN'].includes(initialVal)) initialVal = 'FOREIGN';
    }
    this.valorCorregido.set(initialVal);
    this.motivoCorreccion.set(diferencia.descripcion ?? 'Corrección aceptada por coordinación');
    this.mostrarFormularioCorreccion.set(true);
  }

  cerrarCorreccion() {
    this.mostrarFormularioCorreccion.set(false);
    this.diferenciaSeleccionada.set(null);
    this.valorCorregido.set('');
    this.motivoCorreccion.set('');
  }

  isDateField(campo: string): boolean {
    return ['birth_date', 'started_at', 'ended_at'].includes(campo);
  }

  isNationalityField(campo: string): boolean {
    return campo === 'nationality';
  }

  isCountryField(campo: string): boolean {
    return ['birth_country', 'identification_country', 'country'].includes(campo);
  }

  isOfficialIdTypeField(campo: string): boolean {
    return campo === 'official_id_type';
  }

  isBooleanField(campo: string): boolean {
    return ['is_current', 'is_active', 'has_identification_evidence'].includes(campo);
  }

  async aplicarCorreccion() {
    const solicitud = this.facade.solicitudSeleccionada();
    const dif = this.diferenciaSeleccionada();
    if (!solicitud || !dif) return;

    if (this.requiereRegistro(dif) && !this.registroSeleccionado()) {
      this.alerts.showAlert('Selecciona el registro indicado por el verificador.', 'warning');
      return;
    }

    let nuevoValor = this.valorCorregido().trim();
    const campo = dif.campo;

    // Specific field validations
    if (nuevoValor) {
      if (campo === 'curp') {
        const curpClean = nuevoValor.toUpperCase();
        if (curpClean.length > 18) {
          this.alerts.showAlert('La CURP no puede exceder 18 caracteres.', 'warning');
          return;
        }
        if (!curpClean.includes('*') && !/^[A-Z\d]{18}$/i.test(curpClean)) {
          this.alerts.showAlert('La CURP debe tener un formato válido de 18 caracteres alfanuméricos.', 'warning');
          return;
        }
        nuevoValor = curpClean;
      }

      if (campo === 'rfc') {
        const rfcClean = nuevoValor.toUpperCase();
        if (rfcClean.length < 12 || rfcClean.length > 13) {
          this.alerts.showAlert('El RFC debe tener exactamente 12 o 13 caracteres.', 'warning');
          return;
        }
        const rfcRegex = /^([A-ZÑ&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/i;
        if (!rfcRegex.test(rfcClean)) {
          this.alerts.showAlert('El formato de RFC es inválido.', 'warning');
          return;
        }
        nuevoValor = rfcClean;
      }

      if (campo === 'phone_number') {
        const digits = nuevoValor.replace(/\D/g, '');
        if (digits.length !== 10 && digits.length !== 12) {
          this.alerts.showAlert('El teléfono debe contener exactamente 10 dígitos numéricos.', 'warning');
          return;
        }
      }

      if (campo === 'official_id_number') {
        if (nuevoValor.length > 25) {
          this.alerts.showAlert('El número de identificación no puede exceder 25 caracteres.', 'warning');
          return;
        }
      }
    }

    const req = {
      visit_id: solicitud.visitas.at(-1)?.id || '',
      seccion: dif.seccion,
      campo: dif.campo,
      valor_original: dif.datoDeclarado,
      valor_observado: dif.datoObservado,
      valor_corregido: nuevoValor || dif.datoObservado,
      motivo: this.motivoCorreccion().trim() || dif.descripcion,
      lock_version: solicitud.lockVersion,
      record_id: this.registroSeleccionado() || undefined,
      difference_index: dif.indice,
    };

    const success = await this.facade.aplicarCorreccion(solicitud.id, req);
    if (success) {
      this.alerts.showAlert('Corrección guardada y aplicada al expediente.', 'success');
      this.cerrarCorreccion();
    }
  }

  etiquetaSeccion(seccion: string): string {
    return (
      (
        {
          personal_data: 'Datos personales',
          personal_info: 'Datos personales',
          family_members: 'Familiares y referencias',
          residences: 'Domicilios',
          vehicles: 'Vehículos',
          assets_liabilities: 'Bienes y compromisos',
          employments: 'Empleos',
          commercial_credits: 'Créditos comerciales',
        } as Record<string, string>
      )[seccion] || 'Datos de la solicitud'
    );
  }

  etiquetaCampo(campo: string): string {
    return (
      (
        {
          has_identification_evidence: 'Identificación oficial',
          school_name: 'Escuela',
          proof_reference: 'Referencia del comprobante',
          first_name: 'Nombre(s)',
          first_last_name: 'Apellido paterno',
          second_last_name: 'Apellido materno',
          nationality: 'Nacionalidad',
          birth_country: 'País de nacimiento',
          identification_country: 'País emisor de identificación',
          birth_date: 'Fecha de nacimiento',
          birth_place: 'Lugar de nacimiento',
          birth_state: 'Estado de nacimiento',
          birth_city: 'Ciudad de nacimiento',
          curp: 'CURP',
          curp_masked: 'CURP',
          rfc: 'RFC',
          rfc_masked: 'RFC',
          email: 'Correo electrónico',
          phone_number: 'Teléfono',
          official_id_type: 'Tipo de identificación',
          official_id_number: 'Número de identificación',
          official_id_number_masked: 'Número de identificación',
          company_name: 'Empresa / Institución',
          brand: 'Marca',
          model: 'Modelo',
          model_year: 'Año',
          ownership_status: 'Propiedad',
          name: 'Nombre',
          employer_name: 'Empleador',
          job_title: 'Puesto',
          started_at: 'Fecha de inicio',
          ended_at: 'Fecha de término',
          credit_limit: 'Límite de crédito',
          street: 'Calle',
          exterior_number: 'Número exterior',
          interior_number: 'Número interior',
          neighborhood: 'Colonia',
          postal_code: 'Código postal',
          city: 'Ciudad',
          state: 'Estado',
          country: 'País',
          housing_tenure: 'Tipo de vivienda',
          financing_status: 'Financiamiento',
        } as Record<string, string>
      )[campo] || campo.replaceAll('_', ' ')
    );
  }

  requiereRegistro(dif: any): boolean {
    return [
      'family_members',
      'residences',
      'vehicles',
      'assets_liabilities',
      'employments',
      'commercial_credits',
    ].includes(dif.seccion);
  }

  opcionesRegistro(dif: any): Array<{ id: string; nombre: string }> {
    const registros = this.facade.solicitudSeleccionada()?.datosDeclarados?.[dif.seccion];
    if (!Array.isArray(registros)) return [];
    return registros
      .filter((r) => r?.id)
      .map((r) => ({ id: String(r.id), nombre: this.nombreRegistro(dif.seccion, r) }));
  }

  private nombreRegistro(seccion: string, r: Record<string, any>): string {
    if (seccion === 'family_members')
      return (
        [r['first_name'], r['first_last_name'], r['second_last_name']].filter(Boolean).join(' ') ||
        'Familiar'
      );
    if (seccion === 'commercial_credits') return r['company_name'] || 'Crédito comercial';
    if (seccion === 'vehicles')
      return [r['brand'], r['model'], r['model_year']].filter(Boolean).join(' ') || 'Vehículo';
    if (seccion === 'assets_liabilities') return r['name'] || 'Bien o compromiso';
    if (seccion === 'employments') return r['employer_name'] || 'Empleo';
    return (
      [r['street'], r['exterior_number'], r['neighborhood']].filter(Boolean).join(' ') ||
      'Domicilio'
    );
  }

  async finalizarCorrecciones() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    let force = false;
    if (this.diferenciasPendientes().length > 0) {
      const confirmacion = await this.confirmation.confirm({
        title: 'Hay diferencias pendientes',
        message:
          'El expediente aún contiene diferencias sin corregir. Si continúas, avanzará con ese registro pendiente.',
        confirmLabel: 'Finalizar de todos modos',
        tone: 'danger',
      });
      if (!confirmacion) {
        return;
      }
      force = true;
    } else {
      const confirmacion = await this.confirmation.confirm({
        title: 'Finalizar correcciones',
        message:
          'El expediente avanzará a la siguiente etapa de evaluación con el historial de datos original, observado y corregido.',
        confirmLabel: 'Finalizar correcciones',
      });
      if (!confirmacion) {
        return;
      }
    }

    const success = await this.facade.finalizarCorrecciones(solicitud.id, {
      lock_version: solicitud.lockVersion,
      force,
    });
    if (success) {
      this.alerts.showAlert('Correcciones finalizadas y expediente actualizado.', 'success');
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }
}

