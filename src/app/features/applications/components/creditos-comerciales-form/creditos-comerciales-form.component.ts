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

  getSaveFn(index: number) {
    return (rawValue: any): Observable<any> =>
      from(
        this.store.ejecutarGuardado(async () => {
          const detalle = this.store.detalle();
          const idSolicitud = detalle?.id;
          if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

          const payload = { ...rawValue };
          const idRegistro = payload.id;
          const proofType = payload.proof_type;
          delete payload.id;
          delete payload.proof_type;

          if (proofType) {
            payload.details_payload = {
              ...(payload.details_payload ?? {}),
              proof_type: proofType,
            };
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
              this.creditosArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
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

  onEvidenceChange(form: FormGroup, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const recordId = form.value.id;
    if (!file || !recordId) return;
    const state = this.evidenceState(form);
    state.file = file;
    state.uploading = true;
    state.error = undefined;
    this.mediaApi
      .upload({
        file,
        owner_type: 'application_commercial_credit',
        owner_id: recordId,
        purpose: 'COMMERCIAL_EVIDENCE',
      })
      .subscribe({
        next: () => {
          state.uploading = false;
          state.uploaded = true;
          this.cdr.markForCheck();
        },
        error: (error) => {
          state.uploading = false;
          state.error =
            apiValidationErrors(error)['file']?.[0] ??
            apiErrorMessage(error, 'No fue posible subir la evidencia.');
          this.cdr.markForCheck();
        },
      });
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
      await this.api
        .eliminarCreditoComercial(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo)
        .toPromise();
      this.removerCreditoVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch {
    } finally {
      this.cdr.markForCheck();
    }
  }
}
