import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DomicilioFormFactory } from '../../forms/domicilio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { AddressFormComponent } from '../../../../shared/components/address-form/address-form';

@Component({
  selector: 'app-domicilios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddressFormComponent],
  templateUrl: './domicilios-form.component.html',
  styleUrls: ['./domicilios-form.component.css']
})
export class DomiciliosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  domiciliosArray: FormArray = DomicilioFormFactory.createArray(this.fb);
  cargando = false;
  mostrandoFormulario = false;
  formularioActual: FormGroup | null = null;
  indiceEdicion: number | null = null;

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarDomicilios();
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

  get domiciliosGroups(): FormGroup[] {
    return this.domiciliosArray.controls as FormGroup[];
  }

  async cargarDomicilios() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarDomicilios(id));
      this.domiciliosArray.clear();
      (data || []).forEach((domicilio: any) => {
        const form = DomicilioFormFactory.create(this.fb);
        form.patchValue(domicilio);
        this.domiciliosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  abrirFormulario(domicilioExistente?: FormGroup, index?: number) {
    if (domicilioExistente && index !== undefined) {
      this.formularioActual = DomicilioFormFactory.create(this.fb);
      this.formularioActual.patchValue(domicilioExistente.value);
      this.indiceEdicion = index;
    } else {
      this.formularioActual = DomicilioFormFactory.create(this.fb);
      this.indiceEdicion = null;
    }
    this.mostrandoFormulario = true;
    this.cdr.markForCheck();
  }

  cancelarFormulario() {
    this.mostrandoFormulario = false;
    this.formularioActual = null;
    this.indiceEdicion = null;
    this.cdr.markForCheck();
  }

  marcarComoActual(index: number) {
    const yaExisteActual = this.domiciliosGroups.some((g, i) => i !== index && g.value.is_current);
    if (yaExisteActual) {
      this.alerts.showAlert('Ya existe un domicilio actual. Desmarca el anterior antes de guardar para conservar una sola dirección vigente.', 'warning');
    }
    this.domiciliosGroups[index].get('is_current')?.setValue(true);
    this.guardarDomicilioDirecto(this.domiciliosGroups[index]);
  }

  mapToAddressResult(val: any) {
    if (!val || !val.street) return undefined;
    return {
      full_address: '', // No importa para initialAddress
      street: val.street,
      exterior_number: val.exterior_number,
      interior_number: val.interior_number,
      neighborhood: val.neighborhood,
      zip_code: val.postal_code,
      municipality: val.municipality,
      city: val.city,
      state: val.state,
      country: val.country
    };
  }

  onAddressChange(result: any) {
    if (!this.formularioActual) return;
    this.formularioActual.patchValue({
      street: result.street,
      exterior_number: result.exterior_number,
      interior_number: result.interior_number,
      neighborhood: result.neighborhood,
      postal_code: result.zip_code,
      municipality: result.municipality,
      city: result.city,
      state: result.state,
      country: result.country
    });
  }

  async guardarFormulario() {
    if (!this.formularioActual) return;
    
    if (this.formularioActual.invalid) {
      this.formularioActual.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    await this.guardarDomicilioDirecto(this.formularioActual);
    this.cancelarFormulario();
  }

  async guardarDomicilioDirecto(formGroup: FormGroup) {
    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idDomicilio = payload.id;
    delete payload.id;

    try {
      if (idDomicilio) {
        await firstValueFrom(this.api.actualizarDomicilio(idSolicitud, idDomicilio, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearDomicilio(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarDomicilios();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        this.alerts.showAlert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.', 'warning');
      } else {
        this.alerts.showAlert(apiErrorMessage(e, 'No fue posible guardar el domicilio.'), 'error');
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarDomicilio(idDomicilio: string) {
    const confirmacion = await this.confirmation.confirm({ title: 'Eliminar domicilio', message: 'La dirección se eliminará del expediente. Si es la vigente, verifica antes el domicilio que quedará activo.', confirmLabel: 'Sí, eliminar', tone: 'danger' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarDomicilio(idSolicitud, idDomicilio, this.store.detalle()!.versionBloqueo));
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarDomicilios();
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
