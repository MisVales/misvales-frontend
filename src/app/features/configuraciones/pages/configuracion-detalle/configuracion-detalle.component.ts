import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import {
  ConfiguracionDefinicion,
  ConfiguracionVersion,
  ConfigurationValue,
} from '../../data-access/configuraciones.dtos';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import { esConfiguracionVisible } from '../../data-access/configuraciones-visibilidad';

@Component({
  selector: 'app-configuracion-detalle',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion-detalle.component.html',
  styleUrls: ['./configuracion-detalle.component.css'],
})
export class ConfiguracionDetalleComponent implements OnInit {
  protected readonly store = inject(ConfiguracionesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly creando = signal(false);
  protected readonly definicion = computed(() => this.store.definicionSeleccionada());
  protected clave = '';

  protected readonly versionForm = this.fb.nonNullable.group({
    scalar: ['', Validators.required],
    periodStart: [0, [Validators.required, Validators.min(0)]],
    periodEnd: [1, [Validators.required, Validators.min(1)]],
    bankName: ['', Validators.required],
    bankBeneficiary: ['', Validators.required],
    bankAgreement: ['', Validators.required],
    bankClabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]],
    effectiveFrom: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });
  protected readonly transitionForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.clave = this.route.snapshot.paramMap.get('clave') ?? '';
    if (!this.clave || !esConfiguracionVisible(this.clave)) {
      void this.router.navigate(['/configuraciones']);
      return;
    }
    void this.store.consultarDefinicion(this.clave);
    void this.store.consultarVersiones(this.clave);
  }

  protected volver(): void {
    void this.router.navigate(['/configuraciones']);
  }

  protected async crearVersion(): Promise<void> {
    const definition = this.definicion();
    if (!definition || this.versionForm.invalid || !this.valorValido(definition)) {
      this.versionForm.markAllAsTouched();
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
    if (!this.store.error()) {
      this.creando.set(false);
      this.versionForm.reset({ periodStart: 0, periodEnd: 1 });
    }
  }

  protected async publicar(version: ConfiguracionVersion): Promise<void> {
    if (this.transitionForm.invalid) {
      this.transitionForm.markAllAsTouched();
      return;
    }
    await this.store.publicarVersion(
      version.id,
      version.versionRegistro,
      this.transitionForm.controls.reason.value,
    );
  }

  protected async desactivar(version: ConfiguracionVersion): Promise<void> {
    if (this.transitionForm.invalid) {
      this.transitionForm.markAllAsTouched();
      return;
    }
    await this.store.desactivarVersion(
      version.id,
      version.versionRegistro,
      this.transitionForm.controls.reason.value,
    );
  }

  protected mostrarValor(value: ConfigurationValue, definition = this.definicion()): string {
    if (value === null) return 'Sin valor';
    if (definition?.clave === 'RELATION_PAYMENT_BANK' && this.isObject(value)) {
      const clabe = String(value['clabe'] ?? '');
      return `${String(value['name'] ?? '')} · CLABE ••••${clabe.slice(-4)}`;
    }
    if (definition?.clave === 'EARLY_PAYMENT_PERIOD' && this.isObject(value)) {
      return `Día ${String(value['start'])} al ${String(value['end'])} después del corte`;
    }
    if (typeof value === 'object') return JSON.stringify(value);

    const unit = this.etiquetaUnidad(definition?.unidad ?? null);
    return `${String(value)}${unit ? ` ${unit}` : ''}`;
  }

  protected esPeriodo(definition: ConfiguracionDefinicion): boolean {
    return definition.clave === 'EARLY_PAYMENT_PERIOD';
  }

  protected esBanco(definition: ConfiguracionDefinicion): boolean {
    return definition.clave === 'RELATION_PAYMENT_BANK';
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
    if (this.esPeriodo(definition)) {
      return { start: controls.periodStart.value, end: controls.periodEnd.value };
    }
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
    if (definition.tipoValor === 'DECIMAL' || definition.tipoValor === 'PERCENTAGE') {
      return Number(controls.scalar.value);
    }
    return controls.scalar.value;
  }

  private valorValido(definition: ConfiguracionDefinicion): boolean {
    const controls = this.versionForm.controls;
    if (this.esPeriodo(definition)) {
      return controls.periodStart.valid && controls.periodEnd.valid && controls.periodEnd.value > controls.periodStart.value;
    }
    if (this.esBanco(definition)) {
      return controls.bankName.valid && controls.bankBeneficiary.valid && controls.bankAgreement.valid && controls.bankClabe.valid;
    }
    return controls.scalar.valid;
  }

  private isObject(value: ConfigurationValue): value is { [key: string]: ConfigurationValue } {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
