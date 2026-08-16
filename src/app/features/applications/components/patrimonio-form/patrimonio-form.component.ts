import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { PatrimonioFormFactory } from '../../forms/patrimonio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

@Component({
  selector: 'app-patrimonio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  get patrimonioGroups(): FormGroup[] {
    return this.patrimonioArray.controls as FormGroup[];
  }

  get gruposFiltrados(): FormGroup[] {
    return this.patrimonioGroups.filter(g => g.value.entry_type === this.tipoActivo);
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
    }
    this.cdr.markForCheck();
  }

  async guardarRegistro(formGroup: FormGroup) {
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
        await firstValueFrom(this.api.actualizarPatrimonio(idSolicitud, idRegistro, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearPatrimonio(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarPatrimonio();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        this.alerts.showAlert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.', 'warning');
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarRegistroAPI(formGroup: FormGroup, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar registro patrimonial', message: 'El bien o pasivo se eliminará del expediente.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarPatrimonio(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo));
      this.removerRegistroVisual(formGroup);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
