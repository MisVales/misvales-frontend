import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { VehiculoFormFactory } from '../../forms/vehiculo-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { from, Observable, firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';

@Component({
  selector: 'app-vehiculos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AutosaveDirective],
  templateUrl: './vehiculos-form.component.html',
  styleUrls: ['./vehiculos-form.component.css']
})
export class VehiculosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  vehiculosArray: FormArray = VehiculoFormFactory.createArray(this.fb);
  cargando = false;
  
  autosaveStatuses: Record<number, AutosaveStatus> = {};

  get vehiculosGroups(): FormGroup[] {
    return this.vehiculosArray.controls as FormGroup[];
  }

  getSaveFn(index: number) {
    return (rawValue: any): Observable<any> => from(this.store.ejecutarGuardado(async () => {
      const detalle = this.store.detalle();
      const idSolicitud = detalle?.id;
      if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

      const payload = { ...rawValue };
      const idVehiculo = payload.id;
      delete payload.id;

      const request$ = idVehiculo
        ? this.api.actualizarVehiculo(idSolicitud, idVehiculo, payload, detalle.versionBloqueo)
        : this.api.crearVehiculo(idSolicitud, payload, detalle.versionBloqueo);

      return firstValueFrom(request$).then(res => {
        if (!idVehiculo && res && res.id) {
           this.vehiculosArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
        }
        this.store.registrarAutoguardado(res);
        return res;
      });
    }));
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarVehiculos();
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

  async cargarVehiculos() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarVehiculos(id));
      this.vehiculosArray.clear();
      (data || []).forEach((vehiculo: any) => {
        const form = VehiculoFormFactory.create(this.fb);
        form.patchValue(vehiculo);
        this.vehiculosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  agregarVehiculo() {
    this.vehiculosArray.push(VehiculoFormFactory.create(this.fb));
    this.cdr.markForCheck();
  }

  removerVehiculoVisual(index: number) {
    this.vehiculosArray.removeAt(index);
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarVehiculoAPI(index: number, idVehiculo: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar vehículo', message: 'El registro se eliminará del expediente. Esta acción no se puede deshacer.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await this.api.eliminarVehiculo(idSolicitud, idVehiculo, this.store.detalle()!.versionBloqueo).toPromise();
      this.removerVehiculoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
