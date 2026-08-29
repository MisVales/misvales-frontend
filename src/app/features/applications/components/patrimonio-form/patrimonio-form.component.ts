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
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { PatrimonioFormFactory } from '../../forms/patrimonio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../shared/forms/autosave.directive';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api/api-error';
import { MoneyInputDirective } from '../../directives/money-input.directive';
import { AttachmentPreviewComponent } from '../../../../shared/components/media/attachment-preview/attachment-preview.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import {
  PRIVATE_MEDIA_FILE_RULE,
  validateUploadFile,
} from '../../../../shared/utils/files/file-validation';

type TipoPatrimonio = 'ASSET' | 'LIABILITY' | 'ACTIVE_COMMITMENT';

interface OpcionPatrimonio {
  group: string;
  value: string;
  label: string;
}

const OPCIONES_PATRIMONIO: Record<TipoPatrimonio, OpcionPatrimonio[]> = {
  ASSET: [
    ...['Terreno', 'Departamento', 'Local comercial', 'Bodega', 'Oficina'].map((label) => ({
      group: 'Inmuebles',
      value: label,
      label,
    })),
    ...['Negocio propio', 'Maquinaria', 'Equipo de trabajo', 'Herramientas', 'Inventario'].map(
      (label) => ({ group: 'Negocios y equipo', value: label, label }),
    ),
    ...['Ahorros', 'Inversiones', 'Acciones', 'Fondos de inversión'].map((label) => ({
      group: 'Dinero e inversiones',
      value: label,
      label,
    })),
    ...['Muebles de valor', 'Joyas', 'Otro'].map((label) => ({
      group: 'Otros',
      value: label,
      label,
    })),
  ],
  LIABILITY: [
    ...[
      'Crédito hipotecario',
      'Crédito automotriz',
      'Préstamo personal',
      'Préstamo bancario',
      'Tarjeta de crédito',
      'Crédito de nómina',
      'Crédito Infonavit',
      'Crédito Fovissste',
      'Préstamo con financiera',
      'Préstamo con caja de ahorro',
      'Préstamo familiar',
      'Deuda con tienda departamental',
      'Deuda comercial',
      'Otro',
    ].map((label) => ({ group: 'Pasivos', value: label, label })),
  ],
  ACTIVE_COMMITMENT: [
    ...[
      'Renta de vivienda',
      'Renta de local',
      'Pensión alimenticia',
      'Colegiaturas',
      'Guardería',
      'Manutención de hijos',
      'Apoyo económico a familiares',
      'Arrendamiento de equipo',
      'Arrendamiento de maquinaria',
      'Pago de servicios contratados',
      'Planes o mensualidades recurrentes',
      'Seguros con pago periódico',
      'Otro',
    ].map((label) => ({ group: 'Compromisos activos', value: label, label })),
  ],
};

@Component({
  selector: 'app-patrimonio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    InputErrorComponent,
    AutosaveDirective,
    ApplicationFormErrorStateDirective,
    MoneyInputDirective,
    AttachmentPreviewComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './patrimonio-form.component.html',
  styleUrls: ['./patrimonio-form.component.css'],
})
export class PatrimonioFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);
  private mediaApi = inject(MediaApiService);

  patrimonioArray: FormArray = PatrimonioFormFactory.createArray(this.fb);
  cargando = false;

  tipoActivo: TipoPatrimonio = 'ASSET';
  autosaveStatuses: Record<number, AutosaveStatus> = {};
  mensajeBloqueoCambio?: string;
  private evidenceByForm = new WeakMap<
    FormGroup,
    { uploading: boolean; uploaded: boolean; error?: string; file?: File }
  >();

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;

  get patrimonioGroups(): FormGroup[] {
    return this.patrimonioArray.controls as FormGroup[];
  }

  get gruposFiltrados(): FormGroup[] {
    return this.patrimonioGroups.filter((g) => g.value.entry_type === this.tipoActivo);
  }

  get opcionesPatrimonio(): OpcionPatrimonio[] {
    return OPCIONES_PATRIMONIO[this.tipoActivo];
  }

  opcionesPatrimonioPara(form: FormGroup): OpcionPatrimonio[] {
    const selectedValue = form.controls['name'].value;
    if (
      typeof selectedValue !== 'string' ||
      selectedValue.trim() === '' ||
      this.opcionesPatrimonio.some((option) => option.value === selectedValue)
    ) {
      return this.opcionesPatrimonio;
    }

    return [
      { group: 'Registro existente', value: selectedValue, label: selectedValue },
      ...this.opcionesPatrimonio,
    ];
  }

  get etiquetaTipoActivo(): string {
    return {
      ASSET: 'bien',
      LIABILITY: 'deuda',
      ACTIVE_COMMITMENT: 'compromiso activo',
    }[this.tipoActivo];
  }

  puedeCambiarDePaso(): boolean {
    this.patrimonioGroups.forEach((form) => form.markAllAsTouched());
    this.cdr.markForCheck();
    if (!this.patrimonioGroups.every((form) => form.valid)) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
      return false;
    }
    if (!this.patrimonioGroups.every((form) => this.evidenceState(form).uploaded)) {
      this.mensajeBloqueoCambio =
        'Cada bien, deuda o compromiso activo requiere su propia evidencia.';
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

  getSaveFn(formGroup: FormGroup) {
    return (rawValue: any): Observable<any> =>
      from(
        this.store.ejecutarGuardado(async () => {
          const index = this.patrimonioGroups.indexOf(formGroup);
          const detalle = this.store.detalle();
          const idSolicitud = detalle?.id;
          if (!idSolicitud || detalle.versionBloqueo === undefined) return undefined;

          const payload = { ...rawValue };
          const idRegistro = payload.id;
          const otherDescription = payload.other_description;
          delete payload.id;
          delete payload.other_description;

          const details = { ...(payload.details_payload ?? {}) };
          if (payload.name === 'Otro') {
            payload.details_payload = {
              ...details,
              description: typeof otherDescription === 'string' ? otherDescription.trim() : '',
            };
          } else {
            delete details.description;
            payload.details_payload = Object.keys(details).length > 0 ? details : null;
          }

          const request$ = idRegistro
            ? this.api.actualizarPatrimonio(
                idSolicitud,
                idRegistro,
                payload,
                detalle.versionBloqueo,
              )
            : this.api.crearPatrimonio(idSolicitud, payload, detalle.versionBloqueo);

          return firstValueFrom(request$).then((res) => {
            if (!idRegistro && res && res.id && index !== -1) {
              this.patrimonioArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
            }
            this.store.registrarAutoguardado(res);
            return res;
          });
        }),
      );
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarPatrimonio();
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
        state.error = 'Completa los datos del bien o compromiso antes de adjuntar la evidencia.';
        this.cdr.markForCheck();
        return;
      }

      await firstValueFrom(
        this.mediaApi.upload({
          file,
          owner_type: 'application_asset_liability',
          owner_id: recordId,
          purpose: 'ASSET_EVIDENCE',
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
        this.prepararFormulario(form);
        form.patchValue({
          ...item,
          other_description: item.name === 'Otro' ? (item.details_payload?.description ?? '') : '',
        });
        this.configurarDescripcionOtro(form);
        this.evidenceByForm.set(form, { uploading: false, uploaded: item.has_evidence === true });
        this.patrimonioArray.push(form);
      });
    } catch {
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  setTipoTab(tipo: TipoPatrimonio) {
    this.tipoActivo = tipo;
    this.cdr.markForCheck();
  }

  agregarRegistro() {
    const form = PatrimonioFormFactory.create(this.fb);
    this.prepararFormulario(form);
    form.patchValue({ entry_type: this.tipoActivo });
    this.evidenceByForm.set(form, { uploading: false, uploaded: false });
    this.patrimonioArray.push(form);
    this.cdr.markForCheck();
  }

  esOtro(form: FormGroup): boolean {
    return form.controls['name'].value === 'Otro';
  }

  private prepararFormulario(form: FormGroup): void {
    form.controls['name'].valueChanges.subscribe(() => {
      this.configurarDescripcionOtro(form);
      this.cdr.markForCheck();
    });
    this.configurarDescripcionOtro(form);
  }

  private configurarDescripcionOtro(form: FormGroup): void {
    const description = form.controls['other_description'];

    if (form.controls['name'].value === 'Otro') {
      description.setValidators([Validators.required, Validators.maxLength(180)]);
    } else {
      description.setValidators([Validators.maxLength(180)]);
      description.setValue('', { emitEvent: false });
    }

    description.updateValueAndValidity({ emitEvent: false });
  }

  removerRegistroVisual(formGroup: FormGroup) {
    const index = this.patrimonioGroups.findIndex((g) => g === formGroup);
    if (index !== -1) {
      this.patrimonioArray.removeAt(index);
      delete this.autosaveStatuses[index];
    }
    this.cdr.markForCheck();
  }

  async eliminarRegistroAPI(formGroup: FormGroup, idRegistro: string) {
    const confirmacion = await this.confirmation.confirm({
      title: 'Eliminar registro patrimonial',
      message: 'El bien o pasivo se eliminará del expediente.',
      confirmLabel: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(
        this.api.eliminarPatrimonio(
          idSolicitud,
          idRegistro,
          this.store.detalle()!.versionBloqueo,
        ),
      );
      this.removerRegistroVisual(formGroup);
      await this.store.refrescarDetalleSilencioso(idSolicitud);
    } catch {
    } finally {
      this.cdr.markForCheck();
    }
  }
}
