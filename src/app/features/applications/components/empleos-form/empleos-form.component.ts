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
    await this.esperarDetalle();
    await this.cargarEmpleos();
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

  async cargarEmpleos() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarEmpleos(id));
      this.empleosArray.clear();
      (data || []).forEach((item: any) => {
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
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idRegistro = payload.id;
    delete payload.id;

    try {
      if (idRegistro) {
        await firstValueFrom(this.api.actualizarEmpleo(idSolicitud, idRegistro, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearEmpleo(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarEmpleos();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        alert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.');
      }
    }
  }

  async eliminarEmpleoAPI(index: number, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este registro de empleo?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarEmpleo(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo));
      this.removerEmpleoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    }
  }
}
