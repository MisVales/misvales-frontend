import { firstValueFrom, from, Observable } from 'rxjs';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { PatrimonioFormFactory } from '../../forms/patrimonio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';

@Component({
  selector: 'app-patrimonio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AutosaveDirective],
  templateUrl: './patrimonio-form.component.html',
  styleUrls: ['./patrimonio-form.component.css']
})
export class PatrimonioFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  patrimonioArray: FormArray = PatrimonioFormFactory.createArray(this.fb);
  cargando = false;
  
  tipoActivo: 'ASSET' | 'LIABILITY' | 'ACTIVE_COMMITMENT' = 'ASSET';
  autosaveStatuses: Record<number, AutosaveStatus> = {};

  get patrimonioGroups(): FormGroup[] {
    return this.patrimonioArray.controls as FormGroup[];
  }

  get gruposFiltrados(): FormGroup[] {
    return this.patrimonioGroups.filter(g => g.value.entry_type === this.tipoActivo);
  }

  getSaveFn(formGroup: FormGroup) {
    return (rawValue: any): Observable<any> => from(this.store.ejecutarGuardado(async () => {
      const index = this.patrimonioGroups.indexOf(formGroup);
      const detalle = this.store.detalle();
      const idSolicitud = detalle?.id;
      if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

      const payload = { ...rawValue };
      const idRegistro = payload.id;
      delete payload.id;

      const request$ = idRegistro
        ? this.api.actualizarPatrimonio(idSolicitud, idRegistro, payload, detalle.versionBloqueo)
        : this.api.crearPatrimonio(idSolicitud, payload, detalle.versionBloqueo);

      return firstValueFrom(request$).then(res => {
        if (!idRegistro && res && res.id && index !== -1) {
           this.patrimonioArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
        }
        this.store.registrarAutoguardado(res);
        return res;
      });
    }));
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarPatrimonio();
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

  async cargarPatrimonio() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarPatrimonio(id));
      this.patrimonioArray.clear();
      (data || []).forEach((item: any) => {
        const form = PatrimonioFormFactory.create(this.fb);
        form.patchValue(item);
        this.patrimonioArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  setTipoTab(tipo: 'ASSET' | 'LIABILITY' | 'ACTIVE_COMMITMENT') {
    this.tipoActivo = tipo;
    this.cdr.markForCheck();
  }

  agregarRegistro() {
    const form = PatrimonioFormFactory.create(this.fb);
    form.patchValue({ entry_type: this.tipoActivo });
    this.patrimonioArray.push(form);
    this.cdr.markForCheck();
  }

  removerRegistroVisual(formGroup: FormGroup) {
    const index = this.patrimonioGroups.findIndex(g => g === formGroup);
    if (index !== -1) {
      this.patrimonioArray.removeAt(index);
      delete this.autosaveStatuses[index];
    }
    this.cdr.markForCheck();
  }

  async eliminarRegistroAPI(formGroup: FormGroup, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar registro patrimonial', message: 'El bien o pasivo se eliminará del expediente.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await this.api.eliminarPatrimonio(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo).toPromise();
      this.removerRegistroVisual(formGroup);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}

