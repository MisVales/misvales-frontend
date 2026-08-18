import { Component, inject, OnInit, ChangeDetectorRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DomicilioFormFactory } from '../../forms/domicilio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { firstValueFrom } from 'rxjs';
import { from, Observable } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { AddressFormComponent } from '../../../../shared/components/address-form/address-form';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';

@Component({
  selector: 'app-domicilios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AddressFormComponent, AutosaveDirective, ApplicationFormErrorStateDirective],
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
  autosaveStatus: AutosaveStatus = 'idle';
  mensajeBloqueoCambio?: string;

  @ViewChild(AddressFormComponent)
  private addressForm?: AddressFormComponent;

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;

  saveCurrentAddress = (): Observable<unknown> =>
    this.formularioActual ? from(this.guardarDomicilioDirecto(this.formularioActual)) : from([]);

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

  puedeCambiarDePaso(): boolean {
    if (!this.mostrandoFormulario || !this.formularioActual) return true;

    this.formularioActual.markAllAsTouched();
    const direccionEditada = this.addressForm?.form.dirty ?? false;
    const esDomicilioNuevo = !this.formularioActual.value.id;

    // El subformulario usa catálogos externos sólo para facilitar la captura.
    // Sincroniza cambios reales, pero la validez que se guarda es la del
    // formulario de domicilio, no la disponibilidad del catálogo.
    if (direccionEditada || esDomicilioNuevo) {
      this.addressForm?.validarAntesDeSalir();
    }
    this.cdr.markForCheck();

    if (!this.formularioActual.valid) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
      return false;
    }

    if (this.autoguardados.some((autosave) => autosave.hasUnsavedChanges || autosave.currentStatus === 'saving')) {
      this.mensajeBloqueoCambio = 'Guardando los cambios. Espera a que aparezca “Guardado” antes de cambiar de pestaña.';
      this.autoguardados.forEach((autosave) => autosave.flush());
      return false;
    }

    this.mensajeBloqueoCambio = undefined;
    return true;
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
    void this.guardarDomicilioDirecto(this.domiciliosGroups[index]).catch(() => undefined);
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

  async guardarYFinalizar() {
    if (!this.formularioActual) return;
    if (this.formularioActual.invalid) {
      this.formularioActual.markAllAsTouched();
      return;
    }
    try {
      await this.guardarDomicilioDirecto(this.formularioActual);
      this.alerts.showAlert('Domicilio guardado correctamente.', 'success');
      await this.cargarDomicilios();
      this.mostrandoFormulario = false;
      this.formularioActual = null;
      this.indiceEdicion = null;
    } catch (e) {
      // Error handled by guardarDomicilioDirecto
    }
  }

  async guardarDomicilioDirecto(formGroup: FormGroup): Promise<void> {
    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idDomicilio = payload.id;
    delete payload.id;

    try {
      await this.store.ejecutarGuardado(async () => {
        const detalle = this.store.detalle();
        if (!detalle || detalle.versionBloqueo === undefined) return;

        const saved: any = idDomicilio
          ? await firstValueFrom(this.api.actualizarDomicilio(idSolicitud, idDomicilio, payload, detalle.versionBloqueo))
          : await firstValueFrom(this.api.crearDomicilio(idSolicitud, payload, detalle.versionBloqueo));

        const createdId = saved?.id ?? saved?.data?.id;
        if (!idDomicilio && createdId) formGroup.patchValue({ id: createdId }, { emitEvent: false });
        this.store.registrarAutoguardado(saved);
      });
    } catch (e: any) {
      if (e?.status === 409) {
        this.alerts.showAlert('La información cambió en otra sesión. No se guardó este cambio; actualiza el expediente antes de reintentar.', 'warning');
      } else {
        this.alerts.showAlert(apiErrorMessage(e, 'No fue posible guardar el domicilio.'), 'error');
      }
      throw e;
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
