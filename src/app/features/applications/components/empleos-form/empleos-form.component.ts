import { firstValueFrom, from, Observable } from 'rxjs';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { EmpleoFormFactory } from '../../forms/empleo-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';

@Component({
  selector: 'app-empleos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AutosaveDirective],
  templateUrl: './empleos-form.component.html',
  styleUrls: ['./empleos-form.component.css']
})
export class EmpleosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  empleosArray: FormArray = EmpleoFormFactory.createArray(this.fb);
  cargando = false;
  
  autosaveStatuses: Record<number, AutosaveStatus> = {};

  get empleosGroups(): FormGroup[] {
    return this.empleosArray.controls as FormGroup[];
  }

  getSaveFn(index: number) {
    return (rawValue: any): Observable<any> => from(this.store.ejecutarGuardado(async () => {
      const detalle = this.store.detalle();
      const idSolicitud = detalle?.id;
      if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

      const payload = { ...rawValue };
      const idRegistro = payload.id;
      delete payload.id;

      const request$ = idRegistro
        ? this.api.actualizarEmpleo(idSolicitud, idRegistro, payload, detalle.versionBloqueo)
        : this.api.crearEmpleo(idSolicitud, payload, detalle.versionBloqueo);

      return firstValueFrom(request$).then(res => {
        if (!idRegistro && res && res.id) {
           this.empleosArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
        }
        this.store.registrarAutoguardado(res);
        return res;
      });
    }));
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
    this.cdr.markForCheck();
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
      this.cdr.markForCheck();
    }
  }

  agregarEmpleo() {
    this.empleosArray.push(EmpleoFormFactory.create(this.fb));
    this.cdr.markForCheck();
  }

  removerEmpleoVisual(index: number) {
    this.empleosArray.removeAt(index);
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarEmpleoAPI(index: number, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar empleo', message: 'El registro laboral se eliminará del expediente. Esta acción no se puede deshacer.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await this.api.eliminarEmpleo(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo).toPromise();
      this.removerEmpleoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}

