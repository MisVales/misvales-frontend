import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { CreditoComercialFormFactory } from '../../forms/credito-comercial-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-creditos-comerciales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creditos-comerciales-form.component.html',
  styleUrls: ['./creditos-comerciales-form.component.css']
})
export class CreditosComercialesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);

  creditosArray: FormArray = CreditoComercialFormFactory.createArray(this.fb);
  cargando = false;

  get creditosGroups(): FormGroup[] {
    return this.creditosArray.controls as FormGroup[];
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarCreditos();
  }

  private esperarDetalle(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.store.detalle()?.id) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  async cargarCreditos() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarCreditosComerciales(id));
      this.creditosArray.clear();
      (data || []).forEach((item: any) => {
        const form = CreditoComercialFormFactory.create(this.fb);
        form.patchValue(item);
        this.creditosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  agregarCredito() {
    this.creditosArray.push(CreditoComercialFormFactory.create(this.fb));
    this.cdr.markForCheck();
  }

  removerCreditoVisual(index: number) {
    this.creditosArray.removeAt(index);
    this.cdr.markForCheck();
  }

  async guardarCredito(index: number) {
    const formGroup = this.creditosGroups[index];
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idRegistro = payload.id;
    delete payload.id;

    try {
      if (idRegistro) {
        await firstValueFrom(this.api.actualizarCreditoComercial(idSolicitud, idRegistro, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearCreditoComercial(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarCreditos();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        alert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.');
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarCreditoAPI(index: number, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este crédito comercial?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarCreditoComercial(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo));
      this.removerCreditoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
