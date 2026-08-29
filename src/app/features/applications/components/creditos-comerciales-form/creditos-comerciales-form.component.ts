import { firstValueFrom, from, Observable } from 'rxjs';
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
import { CreditoComercialFormFactory } from '../../forms/credito-comercial-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../shared/forms/autosave.directive';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';
import { MoneyInputDirective } from '../../directives/money-input.directive';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api/api-error';
import { AttachmentPreviewComponent } from '../../../../shared/components/media/attachment-preview/attachment-preview.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import {
  PRIVATE_MEDIA_FILE_RULE,
  validateUploadFile,
} from '../../../../shared/utils/files/file-validation';

@Component({
  selector: 'app-creditos-comerciales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputErrorComponent,
    AutosaveDirective,
    ApplicationFormErrorStateDirective,
    MoneyInputDirective,
    AttachmentPreviewComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './creditos-comerciales-form.component.html',
  styleUrls: ['./creditos-comerciales-form.component.css'],
})
export class CreditosComercialesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);
  private mediaApi = inject(MediaApiService);

  creditosArray: FormArray = CreditoComercialFormFactory.createArray(this.fb);
  cargando = false;

  autosaveStatuses: Record<number, AutosaveStatus> = {};
  mensajeBloqueoCambio?: string;
  private evidenceByForm = new WeakMap<
    FormGroup,
    { uploading: boolean; uploaded: boolean; error?: string; file?: File }
  >();

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;

  get creditosGroups(): FormGroup[] {
    return this.creditosArray.controls as FormGroup[];
  }

  puedeCambiarDePaso(): boolean {
    this.creditosGroups.forEach((form) => form.markAllAsTouched());
    this.cdr.markForCheck();
    if (!this.creditosGroups.every((form) => form.valid)) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
      return false;
    }
    if (!this.creditosGroups.every((form) => this.evidenceState(form).uploaded)) {
      this.mensajeBloqueoCambio = 'Cada crédito comercial requiere su propia evidencia.';
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
          const idRegistro = payload.id || form.value.id;
          const proofType = payload.proof_type;
          delete payload.id;
          delete payload.proof_type;

          if (payload.credit_limit !== undefined && payload.credit_limit !== null) {
            const cleanLimit = String(payload.credit_limit).replaceAll(',', '').trim();
            payload.credit_limit = cleanLimit === '' ? null : cleanLimit;
          }

          if (
            !payload.proof_reference ||
            typeof payload.proof_reference !== 'string' ||
            !payload.proof_reference.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
          ) {
            delete payload.proof_reference;
          }

          if (proofType) {
            payload.details_payload = {
              ...(payload.details_payload ?? {}),
              proof_type: proofType,
            };
          } else if (!payload.details_payload || Object.keys(payload.details_payload).length === 0) {
            delete payload.details_payload;
          }

          const request$ = idRegistro
            ? this.api.actualizarCreditoComercial(
                idSolicitud,
                idRegistro,
                payload,
                detalle.versionBloqueo,
              )
            : this.api.crearCreditoComercial(idSolicitud, payload, detalle.versionBloqueo);

          return firstValueFrom(request$).then((res) => {
            if (!idRegistro && res && res.id) {
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
    await this.cargarCreditos();
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
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const state = this.evidenceState(form);

    const validationError = validateUploadFile(file, PRIVATE_MEDIA_FILE_RULE);
    if (validationError) {
      state.file = undefined;
      state.error = validationError;
      state.uploading = false;
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

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
        state.error = 'Completa los datos del crédito antes de adjuntar la evidencia.';
        this.cdr.markForCheck();
        return;
      }

      await firstValueFrom(
        this.mediaApi.upload({
          file,
          owner_type: 'application_commercial_credit',
          owner_id: recordId,
          purpose: 'COMMERCIAL_EVIDENCE',
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
        form.patchValue({
          ...item,
          proof_type: item.details_payload?.proof_type ?? '',
        });
        this.evidenceByForm.set(form, { uploading: false, uploaded: item.has_evidence === true });
        this.creditosArray.push(form);
      });
    } catch {
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  agregarCredito() {
    const form = CreditoComercialFormFactory.create(this.fb);
    this.evidenceByForm.set(form, { uploading: false, uploaded: false });
    this.creditosArray.push(form);
    this.cdr.markForCheck();
  }

  removerCreditoVisual(index: number) {
    this.creditosArray.removeAt(index);
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarCreditoAPI(index: number, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({
      title: 'Eliminar crédito comercial',
      message: 'El registro crediticio se eliminará del expediente.',
      confirmLabel: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(
        this.api.eliminarCreditoComercial(
          idSolicitud,
          idRegistro,
          this.store.detalle()!.versionBloqueo,
        ),
      );
      this.removerCreditoVisual(index);
      await this.store.refrescarDetalleSilencioso(idSolicitud);
    } catch {
    } finally {
      this.cdr.markForCheck();
    }
  }
}
