import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { VehiculoFormFactory } from '../../forms/vehiculo-form.factory';
import {
  CatalogoVehiculos,
  SolicitudesDistribuidoraApiService,
} from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { from, Observable, firstValueFrom } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../shared/forms/autosave.directive';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api/api-error';
import { AttachmentPreviewComponent } from '../../../../shared/components/media/attachment-preview/attachment-preview.component';
import { StrictNumberInputDirective } from '../../../../shared/directives/strict-number-input.directive';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-vehiculos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    InputErrorComponent,
    AutosaveDirective,
    ApplicationFormErrorStateDirective,
    AttachmentPreviewComponent,
    StrictNumberInputDirective,
    RefactorSelectComponent,
  ],
  templateUrl: './vehiculos-form.component.html',
  styleUrls: ['./vehiculos-form.component.css'],
})
export class VehiculosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);
  private mediaApi = inject(MediaApiService);

  vehiculosArray: FormArray = VehiculoFormFactory.createArray(this.fb);
  cargando = false;
  cargandoCatalogo = false;
  errorCatalogo?: string;
  marcasVehiculos: string[] = [];
  tiposVehiculos: string[] = [];
  readonly minModelYear = 1990;
  readonly maxModelYear = new Date().getFullYear() + 1;

  autosaveStatuses: Record<number, AutosaveStatus> = {};
  mensajeBloqueoCambio?: string;
  private evidenceByForm = new WeakMap<
    FormGroup,
    { uploading: boolean; uploaded: boolean; error?: string; file?: File }
  >();

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;

  get vehiculosGroups(): FormGroup[] {
    return this.vehiculosArray.controls as FormGroup[];
  }

  puedeCambiarDePaso(): boolean {
    this.vehiculosGroups.forEach((form) => form.markAllAsTouched());
    this.cdr.markForCheck();
    if (!this.vehiculosGroups.every((form) => form.valid)) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
      return false;
    }
    if (!this.vehiculosGroups.every((form) => this.evidenceState(form).uploaded)) {
      this.mensajeBloqueoCambio =
        'Cada vehículo registrado requiere su propia evidencia. Adjunta el archivo o elimina el vehículo.';
      return false;
    }

    if (
      this.autoguardados.some(
        (autosave) => autosave.hasUnsavedChanges || autosave.currentStatus === 'saving',
      )
    ) {
      this.mensajeBloqueoCambio =
        'Guardando los cambios. Espera a que aparezca “Guardado” antes de cambiar de pestaña.';
      this.autoguardados.forEach((autosave) => autosave.flush());
      return false;
    }

    this.mensajeBloqueoCambio = undefined;
    return true;
  }

  getSaveFn(form: FormGroup) {
    return (rawValue: any): Observable<any> =>
      from(
        this.store.ejecutarGuardado(async () => {
          const detalle = this.store.detalle();
          const idSolicitud = detalle?.id;
          if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

          const payload = { ...rawValue };
          const idVehiculo = payload.id || form.value.id;
          delete payload.id;

          if (payload.model_year === '' || payload.model_year === undefined) {
            payload.model_year = null;
          } else if (payload.model_year !== null) {
            const parsedYear = Number(payload.model_year);
            payload.model_year = isNaN(parsedYear) ? null : parsedYear;
          }

          if (payload.brand === '') payload.brand = null;
          if (payload.model === '') payload.model = null;
          if (payload.vehicle_type === '') payload.vehicle_type = null;
          if (payload.ownership_status === '') payload.ownership_status = null;
          if (payload.details_payload === null || payload.details_payload === undefined) {
            delete payload.details_payload;
          }

          const request$ = idVehiculo
            ? this.api.actualizarVehiculo(idSolicitud, idVehiculo, payload, detalle.versionBloqueo)
            : this.api.crearVehiculo(idSolicitud, payload, detalle.versionBloqueo);

          return firstValueFrom(request$).then((res) => {
            if (!idVehiculo && res && res.id) {
              form.patchValue({ id: res.id }, { emitEvent: false });
            }
            this.store.registrarAutoguardado(res);
            return res;
          });
        }),
      );
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await Promise.all([this.cargarVehiculos(), this.cargarCatalogoVehiculos()]);
    this.incluirValoresExistentesEnCatalogo();
  }

  evidenceState(form: FormGroup) {
    let state = this.evidenceByForm.get(form);
    if (!state) {
      state = { uploading: false, uploaded: false };
      this.evidenceByForm.set(form, state);
    }
    return state;
  }

  async onEvidenceChange(form: FormGroup, event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;

    const state = this.evidenceState(form);
    state.file = file;
    state.uploading = true;
    state.error = undefined;
    this.cdr.markForCheck();

    try {
      let recordId = form.value.id;
      if (!recordId) {
        // Guardar el registro en borrador para generar el ID en el backend
        const res = await firstValueFrom(this.getSaveFn(form)(form.value));
        recordId = res?.id || form.value.id;
      }

      if (!recordId) {
        state.uploading = false;
        state.error = 'Completa los datos del vehículo antes de adjuntar la evidencia.';
        this.cdr.markForCheck();
        return;
      }

      await firstValueFrom(
        this.mediaApi.upload({
          file,
          owner_type: 'application_vehicle',
          owner_id: recordId,
          purpose: 'VEHICLE_EVIDENCE',
        }),
      );

      state.uploading = false;
      state.uploaded = true;
      const idSol = this.store.detalle()?.id;
      if (idSol) {
        await this.store.refrescarDetalleSilencioso(idSol);
      }
      this.alerts.showAlert('Evidencia adjuntada y guardada correctamente.', 'success');
      this.cdr.markForCheck();
    } catch (error: any) {
      state.uploading = false;
      state.error =
        apiValidationErrors(error)['file']?.[0] ??
        apiErrorMessage(error, 'No fue posible subir la evidencia.');
      this.cdr.markForCheck();
    }
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
        this.evidenceByForm.set(form, {
          uploading: false,
          uploaded: vehiculo.has_evidence === true,
        });
        this.vehiculosArray.push(form);
      });
    } catch {
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  private async cargarCatalogoVehiculos(): Promise<void> {
    this.cargandoCatalogo = true;
    this.errorCatalogo = undefined;
    this.cdr.markForCheck();

    try {
      const catalogo = await firstValueFrom(this.api.obtenerCatalogoVehiculos());
      this.asignarCatalogo(catalogo);
    } catch {
      this.errorCatalogo =
        'No fue posible cargar el catálogo de marcas y tipos de vehículos. Intenta de nuevo antes de agregar un vehículo.';
    } finally {
      this.cargandoCatalogo = false;
      this.cdr.markForCheck();
    }
  }

  private asignarCatalogo(catalogo: CatalogoVehiculos): void {
    this.marcasVehiculos = [...new Set(catalogo.brands ?? [])].sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
    this.tiposVehiculos = [...new Set(catalogo.vehicle_types ?? [])].sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }

  private incluirValoresExistentesEnCatalogo(): void {
    this.vehiculosGroups.forEach((form) => {
      this.incluirValorLegado(this.marcasVehiculos, form.value.brand);
      this.incluirValorLegado(this.tiposVehiculos, form.value.vehicle_type);
    });
  }

  private incluirValorLegado(catalogo: string[], value: unknown): void {
    if (typeof value !== 'string' || value.trim() === '' || catalogo.includes(value)) return;

    catalogo.push(value);
    catalogo.sort((a, b) => a.localeCompare(b, 'es'));
  }

  agregarVehiculo() {
    const form = VehiculoFormFactory.create(this.fb);
    this.evidenceByForm.set(form, { uploading: false, uploaded: false });
    this.vehiculosArray.push(form);
    this.cdr.markForCheck();
  }

  removerVehiculoVisual(index: number) {
    this.vehiculosArray.removeAt(index);
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarVehiculoAPI(index: number, idVehiculo: string) {
    const confirmacion = await this.confirmation.confirm({
      title: 'Eliminar vehículo',
      message: 'El registro se eliminará del expediente. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(
        this.api.eliminarVehiculo(
          idSolicitud,
          idVehiculo,
          this.store.detalle()!.versionBloqueo,
        ),
      );
      this.removerVehiculoVisual(index);
      await this.store.refrescarDetalleSilencioso(idSolicitud);
    } catch {
    } finally {
      this.cdr.markForCheck();
    }
  }
}
