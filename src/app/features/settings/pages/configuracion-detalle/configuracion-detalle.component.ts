import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import {
  ConfiguracionDefinicion,
  ConfiguracionVersion,
  ConfigurationValue,
} from '../../data-access/configuraciones.dtos';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import {
  esConfiguracionEditable,
  esConfiguracionVisible,
} from '../../data-access/configuraciones-visibilidad';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

const fechaVigenciaNoPasada = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;

  const fecha = DateTime.fromISO(control.value, { zone: 'America/Monterrey' });
  return fecha.isValid && fecha < DateTime.now().setZone('America/Monterrey').startOf('minute')
    ? { pastDate: true }
    : null;
};

const zonaHorariaValida = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;

  return DateTime.now().setZone(value).isValid ? null : { timezone: true };
};

@Component({
  selector: 'app-configuracion-detalle',
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './configuracion-detalle.component.html',
  styleUrls: ['./configuracion-detalle.component.css'],
})
export class ConfiguracionDetalleComponent implements OnInit {
  protected readonly store = inject(ConfiguracionesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly alerts = inject(AlertService);
  protected readonly creando = signal(false);
  protected readonly controlesVersionConErrorVisible = signal<
    ReadonlySet<keyof typeof this.versionForm.controls>
  >(new Set());
  protected readonly motivoTransicionConErrorVisible = signal(false);
  protected readonly definicion = computed(() => this.store.definicionSeleccionada());
  protected clave = '';

  protected readonly versionForm = this.fb.nonNullable.group({
    scalar: ['', Validators.required],
    bankName: ['', Validators.required],
    bankBeneficiary: ['', Validators.required],
    bankAgreement: ['', Validators.required],
    bankClabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]],
    effectiveFrom: ['', [Validators.required, fechaVigenciaNoPasada]],
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });
  protected readonly transitionForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.clave = this.route.snapshot.paramMap.get('clave') ?? '';
    if (
      !this.clave ||
      !esConfiguracionVisible(this.clave) ||
      !esConfiguracionEditable(this.clave)
    ) {
      void this.router.navigate(['/configuraciones']);
      return;
    }
    if (this.clave === 'CUT_DAY_OF_MONTH') {
      this.versionForm.controls.scalar.addValidators([
        Validators.pattern(/^\d+$/),
        Validators.min(1),
        Validators.max(31),
      ]);
      this.versionForm.controls.scalar.updateValueAndValidity();
    }
    if (this.esPorcentaje()) {
      this.versionForm.controls.scalar.addValidators([Validators.min(0), Validators.max(100)]);
      this.versionForm.controls.scalar.updateValueAndValidity();
    }
    if (this.clave === 'BUSINESS_TIMEZONE') {
      this.versionForm.controls.scalar.addValidators(zonaHorariaValida);
      this.versionForm.controls.scalar.updateValueAndValidity();
    }
    void this.cargarConfiguracion();
  }

  protected volver(): void {
    void this.router.navigate(['/configuraciones']);
  }

  protected async crearVersion(): Promise<void> {
    const definition = this.definicion();
    if (!definition || !this.formularioVersionValido(definition)) {
      this.mostrarErroresDeVersion();
      return;
    }
    const local = DateTime.fromISO(this.versionForm.controls.effectiveFrom.value, {
      zone: 'America/Monterrey',
    });
    if (!local.isValid) return;

    await this.store.crearVersion(definition.clave, {
      value: this.valorFormulario(definition),
      effective_from: local.toISO()!,
      reason: this.versionForm.controls.reason.value,
    });
    if (this.store.error()) {
      this.alerts.showAlert(this.store.error()!, 'error');
      return;
    }
    this.creando.set(false);
    this.versionForm.reset();
    this.alerts.success('El borrador de configuración se guardó correctamente.');
  }

  protected async guardarCambios(): Promise<void> {
    const definition = this.definicion();
    if (!definition || !this.valorValido(definition) || this.versionForm.controls.reason.invalid) {
      this.mostrarErroresDeVersion();
      return;
    }

    await this.store.actualizarActual(definition.clave, {
      value: this.valorFormulario(definition),
      reason: this.versionForm.controls.reason.value,
    });
    if (this.store.error()) {
      this.alerts.showAlert(this.store.error()!, 'error');
      return;
    }

    this.cargarValorActual(this.definicion());
    this.controlesVersionConErrorVisible.set(new Set());
    this.alerts.success('La configuración se actualizó correctamente.');
  }

  protected async publicar(version: ConfiguracionVersion): Promise<void> {
    if (this.transitionForm.invalid) {
      this.mostrarErrorDeTransicion();
      return;
    }
    await this.store.publicarVersion(
      version.id,
      version.versionRegistro,
      this.transitionForm.controls.reason.value,
    );
    if (this.store.error()) {
      this.alerts.showAlert(this.store.error()!, 'error');
      return;
    }
    this.transitionForm.reset();
    this.alerts.success('La versión de configuración se publicó correctamente.');
  }

  protected async desactivar(version: ConfiguracionVersion): Promise<void> {
    if (this.transitionForm.invalid) {
      this.mostrarErrorDeTransicion();
      return;
    }
    await this.store.desactivarVersion(
      version.id,
      version.versionRegistro,
      this.transitionForm.controls.reason.value,
    );
    if (this.store.error()) {
      this.alerts.showAlert(this.store.error()!, 'error');
      return;
    }
    this.transitionForm.reset();
    this.alerts.success('La versión de configuración se desactivó correctamente.');
  }

  protected marcarControlVersionAlEnfocar(control: keyof typeof this.versionForm.controls): void {
    this.versionForm.controls[control].markAsTouched();
    this.controlesVersionConErrorVisible.update((controles) => new Set([...controles, control]));
  }

  protected marcarMotivoTransicionAlEnfocar(): void {
    this.mostrarErrorDeTransicion();
  }

  /**
   * Mantiene el formulario sincronizado al capturar. Además de hacer la
   * validación inmediata, evita que un navegador conserve texto visible que
   * no llegó al FormControl al enviar el formulario.
   */
  protected actualizarControlVersion(
    control:
      | 'scalar'
      | 'bankName'
      | 'bankBeneficiary'
      | 'bankAgreement'
      | 'bankClabe'
      | 'effectiveFrom'
      | 'reason',
    value: string,
  ): void {
    this.versionForm.controls[control].setValue(value);
    if (control === 'scalar' && this.esDiaGlobalDeCorte()) {
      this.marcarControlVersionAlEnfocar(control);
    }
    this.store.limpiarError();
  }

  protected actualizarDiaGlobalDeCorte(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Number.parseInt(input.value, 10);
    const value = Number.isFinite(parsed) ? String(Math.min(parsed, 31)) : input.value;
    input.value = value;
    this.versionForm.controls.scalar.setValue(value);
    this.marcarControlVersionAlEnfocar('scalar');
    this.store.limpiarError();
  }

  protected actualizarMotivoTransicion(value: string): void {
    this.transitionForm.controls.reason.setValue(value);
    this.store.limpiarError();
  }

  protected mostrarErrorVersion(control: keyof typeof this.versionForm.controls): boolean {
    return this.controlesVersionConErrorVisible().has(control);
  }

  protected placeholderValor(definition: ConfiguracionDefinicion): string {
    if (definition.clave === 'CUT_DAY_OF_MONTH') return 'Ej. 25';
    if (definition.tipoValor === 'PERCENTAGE') return 'Ej. 5';
    if (definition.tipoValor === 'TIME') return 'Ej. 00:05';
    if (definition.tipoValor === 'TIMEZONE') return 'Ej. America/Monterrey';
    if (definition.unidad === 'MXN') return 'Ej. 500.00';
    if (definition.unidad === 'fortnights') return 'Ej. 12';
    return 'Captura el valor';
  }

  protected esDiaGlobalDeCorte(definition = this.definicion()): boolean {
    return definition?.clave === 'CUT_DAY_OF_MONTH' || this.clave === 'CUT_DAY_OF_MONTH';
  }

  protected diaCorteFueraDeRango(): boolean {
    if (!this.esDiaGlobalDeCorte()) return false;

    const valor = Number(this.versionForm.controls.scalar.value);
    return Number.isFinite(valor) && (valor < 1 || valor > 31);
  }

  protected minimoInicioVigencia(): string {
    return DateTime.now().setZone('America/Monterrey').toFormat("yyyy-LL-dd'T'HH:mm");
  }

  private mostrarErroresDeVersion(): void {
    this.versionForm.markAllAsTouched();
    this.controlesVersionConErrorVisible.set(
      new Set([
        'scalar',
        'bankName',
        'bankBeneficiary',
        'bankAgreement',
        'bankClabe',
        'effectiveFrom',
        'reason',
      ]),
    );
  }

  private mostrarErrorDeTransicion(): void {
    this.transitionForm.controls.reason.markAsTouched();
    this.motivoTransicionConErrorVisible.set(true);
  }

  protected mostrarValor(value: ConfigurationValue, definition = this.definicion()): string {
    if (value === null) return 'Sin valor';
    if (definition?.clave === 'RELATION_PAYMENT_BANK' && this.isObject(value)) {
      const clabe = String(value['clabe'] ?? '');
      return `${String(value['name'] ?? '')} · CLABE ••••${clabe.slice(-4)}`;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    if (definition?.unidad === 'percentage' && !Number.isNaN(Number(value))) {
      return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 4 }).format(Number(value) * 100)} %`;
    }
    if (definition?.unidad === 'MXN' && !Number.isNaN(Number(value))) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
        Number(value),
      );
    }
    if (definition?.unidad === 'fortnights') {
      return `${String(value)} ${Number(value) === 1 ? 'quincena' : 'quincenas'}`;
    }

    const unit = this.etiquetaUnidad(definition?.unidad ?? null);
    return `${String(value)}${unit ? ` ${unit}` : ''}`;
  }

  protected esBanco(definition: ConfiguracionDefinicion): boolean {
    return definition.clave === 'RELATION_PAYMENT_BANK';
  }

  protected tipoEntrada(definition: ConfiguracionDefinicion): 'number' | 'text' | 'time' {
    if (definition.tipoValor === 'TIME') return 'time';
    return ['INTEGER', 'DECIMAL', 'PERCENTAGE', 'DURATION'].includes(definition.tipoValor)
      ? 'number'
      : 'text';
  }

  protected pasoEntrada(definition: ConfiguracionDefinicion): string | null {
    if (definition.tipoValor === 'INTEGER' || definition.tipoValor === 'DURATION') return '1';
    if (definition.tipoValor === 'PERCENTAGE') return '0.01';
    if (definition.tipoValor === 'DECIMAL') return '0.01';
    return null;
  }

  protected ayudaValor(definition: ConfiguracionDefinicion): string {
    if (definition.clave === 'VERIFICATION_START_TIME')
      return 'Primera hora que podrá seleccionar el coordinador al asignar una visita. Ejemplo: 03:00.';
    if (definition.clave === 'VERIFICATION_MAX_START_TIME')
      return 'Última hora que podrá seleccionar el coordinador al asignar una visita. Ejemplo: 23:00.';
    if (definition.unidad === 'percentage')
      return 'Captura el porcentaje completo. Por ejemplo, 5 equivale a 5 %.';
    if (definition.unidad === 'MXN') return 'Captura el importe en pesos mexicanos.';
    if (definition.unidad === 'fortnights')
      return 'Indica cuántas quincenas tendrá cada vale nuevo.';
    return 'Este valor aplicará únicamente a operaciones futuras después de publicarse.';
  }

  private etiquetaUnidad(unit: string | null): string | null {
    if (unit === null) return null;

    const labels: Record<string, string> = {
      day_of_month: 'días',
      days: 'días',
      days_after_cutoff: 'días después del corte',
      hours: 'horas',
      minutes: 'minutos',
      percentage: '%',
    };

    return labels[unit] ?? unit.replaceAll('_', ' ');
  }

  private valorFormulario(definition: ConfiguracionDefinicion): ConfigurationValue {
    const controls = this.versionForm.controls;
    if (this.esBanco(definition)) {
      return {
        name: controls.bankName.value.trim(),
        beneficiary: controls.bankBeneficiary.value.trim(),
        agreement: controls.bankAgreement.value.trim(),
        clabe: controls.bankClabe.value,
      };
    }
    if (definition.tipoValor === 'INTEGER' || definition.tipoValor === 'DURATION') {
      return Number.parseInt(controls.scalar.value, 10);
    }
    if (definition.tipoValor === 'PERCENTAGE') {
      return Number(controls.scalar.value) / 100;
    }
    if (definition.tipoValor === 'DECIMAL') {
      return Number(controls.scalar.value);
    }
    return controls.scalar.value;
  }

  private valorValido(definition: ConfiguracionDefinicion): boolean {
    const controls = this.versionForm.controls;
    if (this.esBanco(definition)) {
      return (
        controls.bankName.valid &&
        controls.bankBeneficiary.valid &&
        controls.bankAgreement.valid &&
        controls.bankClabe.valid
      );
    }
    return controls.scalar.valid && !this.diaCorteFueraDeRango();
  }

  private formularioVersionValido(definition: ConfiguracionDefinicion): boolean {
    const controls = this.versionForm.controls;
    return this.valorValido(definition) && controls.effectiveFrom.valid && controls.reason.valid;
  }

  private async cargarConfiguracion(): Promise<void> {
    await Promise.all([
      this.store.consultarDefinicion(this.clave),
      this.store.consultarVersiones(this.clave),
    ]);
    this.cargarValorActual(this.definicion());
  }

  private cargarValorActual(definition: ConfiguracionDefinicion | null): void {
    if (!definition || definition.valorActual === null) return;

    const value = definition.valorActual;
    if (this.esBanco(definition) && this.isObject(value)) {
      this.versionForm.patchValue({
        bankName: String(value['name'] ?? ''),
        bankBeneficiary: String(value['beneficiary'] ?? ''),
        bankAgreement: String(value['agreement'] ?? ''),
        bankClabe: String(value['clabe'] ?? ''),
      });
      return;
    }

    const scalar =
      definition.tipoValor === 'PERCENTAGE' ? String(Number(value) * 100) : String(value);
    this.versionForm.controls.scalar.setValue(scalar);
  }

  private isObject(value: ConfigurationValue): value is { [key: string]: ConfigurationValue } {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  protected esPorcentaje(definition = this.definicion()): boolean {
    return (
      definition?.tipoValor === 'PERCENTAGE' ||
      ['LOAN_COMMISSION_PERCENTAGE', 'INTEREST_RATE_PER_FORTNIGHT'].includes(this.clave)
    );
  }

  protected maximoEntrada(definition: ConfiguracionDefinicion): number | null {
    if (this.esDiaGlobalDeCorte(definition)) return 31;
    return this.esPorcentaje(definition) ? 100 : null;
  }
}
