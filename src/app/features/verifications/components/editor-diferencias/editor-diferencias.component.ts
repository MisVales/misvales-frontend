import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

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
      this.datoObservado.set(ctx.datoObservado);
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

  isNationalityField(): boolean {
    return this.campo() === 'nationality';
  }

  isCountryField(): boolean {
    return ['birth_country', 'identification_country', 'country'].includes(this.campo());
  }

  isOfficialIdTypeField(): boolean {
    return this.campo() === 'official_id_type';
  }

  isBooleanField(): boolean {
    return ['is_current', 'is_active', 'has_identification_evidence'].includes(this.campo());
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
        if (digits.length !== 10 && digits.length !== 12) {
          this.alerts.showAlert('El teléfono debe contener exactamente 10 dígitos numéricos.', 'warning');
          return;
        }
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
}
