import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

const MIN_BIRTH_DATE = '1900-01-01';

function toDateInputValue(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function maxAdultBirthDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return toDateInputValue(date);
}

export interface DiferenciaPayload {
  seccion: string;
  campo: string;
  datoDeclarado: string;
  datoObservado: string;
  descripcion: string;
}

export interface DiferenciaContexto {
  seccion: string;
  campo: string;
  etiqueta: string;
  datoDeclarado: string;
  datoObservado?: string;
  descripcion?: string;
}

@Component({
  selector: 'app-editor-diferencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor-diferencias.component.html',
  styleUrl: './editor-diferencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDiferenciasComponent {
  private readonly alerts = inject(AlertService);
  contexto = input.required<DiferenciaContexto>();
  
  isProcessing = input<boolean>(false);
  
  // Output
  guardar = output<DiferenciaPayload>();
  cancelar = output<void>();

  datoObservado = signal<string>('');
  descripcion = signal<string>('');
  submitted = signal<boolean>(false);
  readonly minBirthDate = MIN_BIRTH_DATE;
  readonly maxAdultDate = maxAdultBirthDate();
  readonly maxDate = toDateInputValue(new Date());
  readonly maxModelYear = String(new Date().getFullYear() + 1);

  constructor() {
    // When contexto is updated, populate inputs
    const ctx = this.contexto;
    // We can also sync via effect in constructor
    import('@angular/core').then(({ effect }) => {
      // noop
    });
  }

  ngOnInit() {
    const ctx = this.contexto();
    if (ctx.datoObservado) {
      this.datoObservado.set(
        ctx.campo === 'phone_number'
          ? this.normalizarTelefonoNacional(ctx.datoObservado)
          : ctx.datoObservado,
      );
    }
    if (ctx.descripcion) {
      this.descripcion.set(ctx.descripcion);
    }
  }

  // Field type helpers
  readonly campo = computed(() => this.contexto().campo);

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

  isDateField(): boolean {
    return ['birth_date', 'started_at', 'ended_at'].includes(this.campo());
  }

  isBirthDateField(): boolean {
    return this.campo() === 'birth_date';
  }

  isNationalityField(): boolean {
    return this.campo() === 'nationality';
  }

  isCountryField(): boolean {
    return ['birth_country', 'identification_country', 'country'].includes(this.campo());
  }

  isOfficialIdTypeField(): boolean {
    return this.campo() === 'official_id_type';
  }

  isHousingTenureField(): boolean {
    return this.campo() === 'housing_tenure';
  }

  isFinancingStatusField(): boolean {
    return this.campo() === 'financing_status';
  }

  isRelationshipField(): boolean {
    return this.campo() === 'relationship';
  }

  isOwnershipStatusField(): boolean {
    return this.campo() === 'ownership_status';
  }

  isVehicleTypeField(): boolean {
    return this.campo() === 'vehicle_type';
  }

  isEntryTypeField(): boolean {
    return this.campo() === 'entry_type';
  }

  isProofTypeField(): boolean {
    return ['proof_type', 'proof_reference_type'].includes(this.campo());
  }

  isCivilStatusField(): boolean {
    return ['marital_status', 'civil_status'].includes(this.campo());
  }

  isBooleanField(): boolean {
    return ['is_current', 'is_active', 'has_identification_evidence', 'has_evidence', 'economic_dependency', 'is_family_reference'].includes(this.campo());
  }

  formatearValorObservado(): string {
    const valor = this.datoObservado();
    if (!valor) return '';
    if (this.isDateField() && typeof valor === 'string') {
      const [year, month, day] = valor.split('-');
      return year && month && day ? `${day}/${month}/${year}` : valor;
    }
    const traducciones: Record<string, string> = {
      MEXICAN: 'Mexicana', FOREIGN: 'Extranjera', MX: 'México', US: 'Estados Unidos', HT: 'Haití',
      CO: 'Colombia', VE: 'Venezuela', GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
      INE: 'Credencial para votar (INE)', PASSPORT: 'Pasaporte', PROFESSIONAL_LICENSE: 'Cédula Profesional', OTHER: 'Otro',
      SPOUSE: 'Esposo(a)', PARTNER: 'Pareja', CHILD: 'Hijo(a)', FATHER: 'Padre', MOTHER: 'Madre', SIBLING: 'Hermano(a)',
      OWNED: 'Propia / Propio', RENTED: 'Rentada', BORROWED: 'Prestada',
      PAID: 'Pagada', MORTGAGE: 'Hipotecada', LOAN: 'Préstamo', INFONAVIT: 'INFONAVIT', NOT_APPLICABLE: 'No Aplica',
      AUTOMOBILE: 'Automóvil', MOTORCYCLE: 'Motocicleta', TRUCK: 'Camioneta / Camión',
      FINANCED: 'Financiado', COMPANY: 'De empresa',
      ASSET: 'Bien', LIABILITY: 'Deuda', ACTIVE_COMMITMENT: 'Compromiso activo',
      CARTA: 'Carta', ESTADO_DE_CUENTA: 'Estado de cuenta',
      SINGLE: 'Soltero(a)', MARRIED: 'Casado(a)', DIVORCED: 'Divorciado(a)', WIDOWED: 'Viudo(a)', COHABITING: 'Unión Libre',
      true: 'Sí (Comprobado)', false: 'No (Sin comprobar)',
    };
    return traducciones[valor] ?? valor;
  }

  isIntegerField(): boolean {
    return this.campo() === 'model_year';
  }

  isNumericField(): boolean {
    return [
      'amount',
      'outstanding_balance',
      'monthly_payment',
      'credit_limit',
      'width_meters',
      'length_meters',
      'built_area_square_meters',
    ].includes(this.campo());
  }

  onPhoneNumberChange(value: string): void {
    this.datoObservado.set(this.normalizarTelefonoNacional(value));
  }

  onValueChange(value: unknown): void {
    this.datoObservado.set(value === null || value === undefined ? '' : String(value));
  }

  onGuardar() {
    this.submitted.set(true);
    const campo = this.campo();
    let valorObservado = this.datoObservado().trim();

    if (!valorObservado && !this.descripcion().trim()) {
      this.alerts.showAlert('Indica el dato observado o describe claramente la diferencia.', 'warning');
      return;
    }

    // Specific field validations
    if (valorObservado) {
      if (campo === 'curp') {
        const curpClean = valorObservado.toUpperCase();
        if (curpClean.length > 18) {
          this.alerts.showAlert('La CURP no puede exceder 18 caracteres.', 'warning');
          return;
        }
        if (!curpClean.includes('*') && !/^[A-Z\d]{18}$/i.test(curpClean)) {
          this.alerts.showAlert('La CURP debe tener un formato válido de 18 caracteres alfanuméricos.', 'warning');
          return;
        }
        valorObservado = curpClean;
      }

      if (campo === 'rfc') {
        const rfcClean = valorObservado.toUpperCase();
        if (rfcClean.length < 12 || rfcClean.length > 13) {
          this.alerts.showAlert('El RFC debe tener exactamente 12 o 13 caracteres.', 'warning');
          return;
        }
        const rfcRegex = /^([A-ZÑ&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/i;
        if (!rfcRegex.test(rfcClean)) {
          this.alerts.showAlert('El formato de RFC es inválido.', 'warning');
          return;
        }
        valorObservado = rfcClean;
      }

      if (campo === 'phone_number') {
        const digits = valorObservado.replace(/\D/g, '');
        if (digits.length !== 10) {
          this.alerts.showAlert('El teléfono debe contener exactamente 10 dígitos numéricos.', 'warning');
          return;
        }
        valorObservado = digits;
      }

      if (this.isDateField() && !this.fechaEsValida(campo, valorObservado)) {
        return;
      }

      if (this.isIntegerField() && (!/^\d{4}$/.test(valorObservado) || Number(valorObservado) < 1990 || Number(valorObservado) > Number(this.maxModelYear))) {
        this.alerts.showAlert(`El año del vehículo debe tener cuatro dígitos y estar entre 1990 y ${this.maxModelYear}.`, 'warning');
        return;
      }

      if (this.isNumericField() && !this.numeroEsValido(campo, valorObservado)) {
        return;
      }

      if (campo === 'official_id_number') {
        if (valorObservado.length > 25) {
          this.alerts.showAlert('El número de identificación no puede exceder 25 caracteres.', 'warning');
          return;
        }
      }
    }

    const contexto = this.contexto();
    this.guardar.emit({
      seccion: contexto.seccion,
      campo: contexto.campo,
      datoDeclarado: contexto.datoDeclarado,
      datoObservado: valorObservado,
      descripcion: this.descripcion().trim()
    });
  }

  private normalizarTelefonoNacional(value: string): string {
    const raw = String(value ?? '').trim();
    const digits = raw.replace(/\D/g, '');
    return raw.startsWith('+') ? digits.slice(-10) : digits.slice(0, 10);
  }

  private fechaEsValida(campo: string, value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !this.fechaCalendarioEsValida(value)) {
      this.alerts.showAlert('Selecciona una fecha válida.', 'warning');
      return false;
    }
    if (campo === 'birth_date' && (value < this.minBirthDate || value > this.maxAdultDate)) {
      this.alerts.showAlert('La fecha de nacimiento debe corresponder a una persona mayor de edad y ser posterior al 01/01/1900.', 'warning');
      return false;
    }
    if (campo === 'started_at' && value > this.maxDate) {
      this.alerts.showAlert('La fecha de inicio no puede ser posterior a hoy.', 'warning');
      return false;
    }

    return true;
  }

  private fechaCalendarioEsValida(value: string): boolean {
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && toDateInputValue(date) === value;
  }

  private numeroEsValido(campo: string, value: string): boolean {
    if (!/^\d{1,15}(?:\.\d{1,4})?$/.test(value)) {
      this.alerts.showAlert('Captura un número válido, sin signo negativo y con hasta 4 decimales.', 'warning');
      return false;
    }
    if (['width_meters', 'length_meters', 'built_area_square_meters'].includes(campo) && Number(value) <= 0) {
      this.alerts.showAlert('La medida debe ser mayor que cero.', 'warning');
      return false;
    }

    return true;
  }
}
