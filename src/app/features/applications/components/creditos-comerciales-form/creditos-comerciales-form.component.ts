import { Component, inject, OnInit } from '@angular/core';
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

  creditosArray: FormArray = CreditoComercialFormFactory.createArray(this.fb);
  cargando = false;

  get creditosGroups(): FormGroup[] {
    return this.creditosArray.controls as FormGroup[];
  }

  async ngOnInit() {
    await this.cargarCreditos();
  }

  async cargarCreditos() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarCreditosComerciales(id));
      this.creditosArray.clear();
      data.forEach((item: any) => {
        const form = CreditoComercialFormFactory.create(this.fb);
        form.patchValue(item);
        this.creditosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  agregarCredito() {
    this.creditosArray.push(CreditoComercialFormFactory.create(this.fb));
  }

  removerCreditoVisual(index: number) {
    this.creditosArray.removeAt(index);
  }

  async guardarCredito(index: number) {
    const formGroup = this.creditosGroups[index];
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    const payload = formGroup.value;
    const idRegistro = payload.id;
    delete payload.id;

    try {
      if (idRegistro) {
        await firstValueFrom(this.api.actualizarCreditoComercial(idSolicitud, idRegistro, payload, version));
      } else {
        await firstValueFrom(this.api.crearCreditoComercial(idSolicitud, payload, version));
      }
      await this.cargarCreditos();
      this.store.cargarDetalle(idSolicitud);
    } catch (e: any) {
      if (e?.status === 409) {
        alert('El expediente fue modificado por otro usuario. Recarga la información antes de continuar.');
      }
    }
  }

  async eliminarCreditoAPI(index: number, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este crédito comercial?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    try {
      await firstValueFrom(this.api.eliminarCreditoComercial(idSolicitud, idRegistro, version));
      this.removerCreditoVisual(index);
      this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    }
  }
}
