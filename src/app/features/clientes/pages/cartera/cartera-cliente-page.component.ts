import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesStore } from '../../state/clientes.store';
import { CarteraApiService } from '../../data-access/api/cartera-api.service';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cartera-cliente-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cartera-cliente-page.component.html',
  styleUrls: ['./cartera-cliente-page.component.css']
})
export class CarteraClientePageComponent implements OnInit, OnDestroy {
  store = inject(ClientesStore);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  api = inject(CarteraApiService);

  cargandoHistorial = this.store.registrandoMovimiento;
  movimientos = this.store.movimientosCartera;
  
  // Modal de registro
  mostrarModal = signal(false);
  form: FormGroup;
  guardando = this.store.registrandoMovimiento;

  constructor() {
    this.form = this.fb.group({
      type: ['', Validators.required],
      amount: [''], // Note does not require amount
      concept: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
    this.form.patchValue({ type });
    this.mostrarModal.set(true);
  }

  cerrarRegistro() {
    this.mostrarModal.set(false);
  }

  async registrarMovimiento() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const clienteId = this.store.detalle()?.id;
    if (!clienteId) return;

    try {
      const request = this.form.value;
      const idempotencyKey = crypto.randomUUID();

      await firstValueFrom(this.store.registrarMovimiento(clienteId, request, idempotencyKey));
      
      this.cerrarRegistro();
      alert('Movimiento registrado correctamente');
    } catch (e: any) {
      alert(this.store.error() || 'Error al registrar el movimiento.');
    }
  }

  getColorBadge(tipo: string): string {
    switch(tipo) {
      case 'CHARGE': return 'bg-red-100 text-red-800';
      case 'PAYMENT': return 'bg-green-100 text-green-800';
      case 'CREDIT': return 'bg-blue-100 text-blue-800';
      case 'NOTE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getNombreTipo(tipo: string): string {
    switch(tipo) {
      case 'CHARGE': return 'Adeudo';
      case 'PAYMENT': return 'Pago';
      case 'CREDIT': return 'Abono';
      case 'NOTE': return 'Nota';
      case 'ADJUSTMENT': return 'Ajuste';
      case 'STATUS_UPDATE': return 'Act. Estado';
      default: return tipo;
    }
  }
}
