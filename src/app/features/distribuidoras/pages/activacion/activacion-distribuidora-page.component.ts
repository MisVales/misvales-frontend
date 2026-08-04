import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-activacion-distribuidora-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activacion-distribuidora-page.component.html',
  styleUrls: ['./activacion-distribuidora-page.component.css']
})
export class ActivacionDistribuidoraPageComponent implements OnInit, OnDestroy {
  store = inject(DistribuidorasStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(DistribuidorasApiService);
  fb = inject(FormBuilder);

  form: FormGroup;
  activando = false;
  errorActivacion: string | null = null;
  exito = false;

  categoriasSimuladas = [
    { id: 'cat-1', nombre: 'Plata', porcentaje: '10.0' },
    { id: 'cat-2', nombre: 'Oro', porcentaje: '12.5' }
  ];

  constructor() {
    this.form = this.fb.group({
      category_version_id: ['', Validators.required],
      reason: [''] // Es opcional o requerido según regla de negocio
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.cargarDetalle(id);
      }
    });
  }

  ngOnDestroy() {
    this.store.limpiarDetalle();
  }

  async confirmarActivacion() {
    const distribuidora = this.store.detalle();
    if (!distribuidora || this.form.invalid) return;

    this.activando = true;
    this.errorActivacion = null;
    try {
      const { category_version_id, reason } = this.form.value;
      // Idealmente, el endpoint activarSolicitud en un módulo completo aceptaría la categoría.
      // Aquí simulamos que se envía junto o inmediatamente después.
      await firstValueFrom(this.api.activarSolicitud(distribuidora.id, distribuidora.versionBloqueo));
      await firstValueFrom(this.api.asignarCategoria(distribuidora.id, distribuidora.versionBloqueo, { category_version_id, reason, starts_at: new Date().toISOString().split('T')[0] }));
      this.exito = true;
      setTimeout(() => {
        this.router.navigate(['/distribuidoras', distribuidora.id]);
      }, 2000);
    } catch (e: any) {
      if (e?.status === 409) {
        this.errorActivacion = 'El registro fue modificado. Recarga la página y vuelve a intentarlo.';
      } else {
        this.errorActivacion = e.error?.message || e.message || 'Error al activar.';
      }
    } finally {
      this.activando = false;
    }
  }

  volver() {
    const id = this.store.detalle()?.id;
    if (id) {
      this.router.navigate(['/distribuidoras', id]);
    } else {
      this.router.navigate(['/distribuidoras']);
    }
  }
}
