import { firstValueFrom } from 'rxjs';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { CreditoComercialFormFactory } from '../../forms/credito-comercial-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { from, Observable } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';

@Component({
  selector: 'app-creditos-comerciales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutosaveDirective],
  templateUrl: './creditos-comerciales-form.component.html',
  styleUrls: ['./creditos-comerciales-form.component.css']
})
export class CreditosComercialesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  creditosArray: FormArray = CreditoComercialFormFactory.createArray(this.fb);
  cargando = false;
  
  autosaveStatuses: Record<number, AutosaveStatus> = {};

  get creditosGroups(): FormGroup[] {
    return this.creditosArray.controls as FormGroup[];
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
        ? this.api.actualizarCreditoComercial(idSolicitud, idRegistro, payload, detalle.versionBloqueo)
        : this.api.crearCreditoComercial(idSolicitud, payload, detalle.versionBloqueo);

      return firstValueFrom(request$).then(res => {
        if (!idRegistro && res && res.id) {
           this.creditosArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
        }
        this.store.registrarAutoguardado(res);
        return res;
      });
    }));
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
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarCreditoAPI(index: number, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar crédito comercial', message: 'El registro crediticio se eliminará del expediente.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await this.api.eliminarCreditoComercial(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo).toPromise();
      this.removerCreditoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}

