import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesStore } from '../../state/clientes.store';
import { CarteraApiService } from '../../data-access/api/cartera-api.service';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { MoneyInputDirective } from '../../../applications/directives/money-input.directive';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-cartera-cliente-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputErrorComponent,
    MoneyInputDirective,
    RefactorSelectComponent,
  ],
  templateUrl: './cartera-cliente-page.component.html',
  styleUrls: ['./cartera-cliente-page.component.css'],
})
export class CarteraClientePageComponent implements OnInit, OnDestroy {
  store = inject(ClientesStore);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  api = inject(CarteraApiService);
  private readonly alerts = inject(AlertService);

  cargandoHistorial = this.store.registrandoMovimiento;
  movimientos = this.store.movimientosCartera;

  // Modal de registro
  mostrarModal = signal(false);
  form: FormGroup;
  guardando = this.store.registrandoMovimiento;
  serverError = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      entry_type: ['NOTE', Validators.required],
      amount: ['', [Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
      informational_status: [''],
      occurred_at: ['', Validators.required],
      due_date: [''],
      last_payment_at: [''],
      note: ['', [Validators.maxLength(500)]],
    });

    this.form.get('entry_type')?.valueChanges.subscribe((type) => {
      const amountCtrl = this.form.get('amount');
      if (type === 'NOTE' || type === 'STATUS_UPDATE') {
        amountCtrl?.clearValidators();
        amountCtrl?.setValue('');
      } else {
        amountCtrl?.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,4})?$/),
        ]);
      }
      amountCtrl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.store.cargarDetalle(id);
        this.store.cargarCartera(id);
      }
    });
  }

  ngOnDestroy() {
    this.store.limpiarDetalle();
  }

  abrirRegistro(type: string = 'NOTE') {
    this.form.reset();
    this.serverError.set(null);
    this.form.patchValue({ entry_type: type, occurred_at: new Date().toISOString().slice(0, 16) });
    this.mostrarModal.set(true);
  }

  cerrarRegistro() {
    this.mostrarModal.set(false);
    this.serverError.set(null);
  }

  async registrarMovimiento() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const clienteId = this.store.detalle()?.id;
    if (!clienteId) return;

    try {
      const value = this.form.value;
      const request = {
        entry_type: value.entry_type,
        amount:
          value.entry_type === 'NOTE' || value.entry_type === 'STATUS_UPDATE'
            ? null
            : String(value.amount),
        informational_status: value.informational_status || null,
        occurred_at: value.occurred_at,
        due_date: value.due_date || null,
        last_payment_at: value.last_payment_at || null,
        note: value.note || null,
        related_voucher_id: null,
      } as any;
      const idempotencyKey = crypto.randomUUID();

      await firstValueFrom(this.store.registrarMovimiento(clienteId, request, idempotencyKey));

      this.cerrarRegistro();
      this.alerts.showAlert('Movimiento informativo registrado.', 'success');
    } catch (e: any) {
      this.alerts.showAlert(
        this.store.error() || 'No fue posible registrar el movimiento.',
        'error',
      );
    }
  }

  getColorBadge(tipo: string): string {
    switch (tipo) {
      case 'DEBT':
      case 'ADJUSTMENT_INCREASE':
        return 'bg-red-100 text-red-800';
      case 'PAYMENT':
      case 'PARTIAL_PAYMENT':
      case 'ADJUSTMENT_DECREASE':
        return 'bg-green-100 text-green-800';
      case 'CREDIT':
        return 'bg-blue-100 text-blue-800';
      case 'NOTE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getNombreTipo(tipo: string): string {
    switch (tipo) {
      case 'DEBT':
        return 'Adeudo';
      case 'PAYMENT':
        return 'Pago';
      case 'PARTIAL_PAYMENT':
        return 'Pago parcial';
      case 'CREDIT':
        return 'Abono';
      case 'NOTE':
        return 'Nota';
      case 'ADJUSTMENT':
      case 'ADJUSTMENT_INCREASE':
      case 'ADJUSTMENT_DECREASE':
        return 'Ajuste';
      case 'STATUS_UPDATE':
        return 'Act. Estado';
      default:
        return tipo;
    }
  }
}
