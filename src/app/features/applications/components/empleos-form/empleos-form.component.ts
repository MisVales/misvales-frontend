import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { EmpleoFormFactory } from '../../forms/empleo-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-empleos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleos-form.component.html',
  styleUrls: ['./empleos-form.component.css']
})
export class EmpleosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);

  empleosArray: FormArray = EmpleoFormFactory.createArray(this.fb);
  cargando = false;

  get empleosGroups(): FormGroup[] {
    return this.empleosArray.controls as FormGroup[];
  }

  async ngOnInit() {
    await this.cargarEmpleos();
  }

  async cargarEmpleos() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarEmpleos(id));
      this.empleosArray.clear();
      data.forEach((item: any) => {
        const form = EmpleoFormFactory.create(this.fb);
        form.patchValue(item);
        this.empleosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  agregarEmpleo() {
    this.empleosArray.push(EmpleoFormFactory.create(this.fb));
  }

  removerEmpleoVisual(index: number) {
    this.empleosArray.removeAt(index);
  }

  async guardarEmpleo(index: number) {
    const formGroup = this.empleosGroups[index];
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
        await firstValueFrom(this.api.actualizarEmpleo(idSolicitud, idRegistro, payload, version));
      } else {
        await firstValueFrom(this.api.crearEmpleo(idSolicitud, payload, version));
      }
      await this.cargarEmpleos();
      this.store.cargarDetalle(idSolicitud);
    } catch (e: any) {
      if (e?.status === 409) {
        alert('El expediente fue modificado por otro usuario. Recarga la información antes de continuar.');
      }
    }
  }

  async eliminarEmpleoAPI(index: number, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este registro de empleo?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    try {
      await firstValueFrom(this.api.eliminarEmpleo(idSolicitud, idRegistro, version));
      this.removerEmpleoVisual(index);
      this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    }
  }
}
