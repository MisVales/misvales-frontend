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
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { FamiliarFormFactory } from '../../forms/familiar-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { AutosaveDirective, AutosaveStatus } from '../../../../shared/forms/autosave.directive';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';
import { maxAdultBirthDate, MIN_BIRTH_DATE } from '../../validators/adult-birth-date.validator';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-familiares-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputErrorComponent,
    AutosaveDirective,
    ApplicationFormErrorStateDirective,
    RefactorSelectComponent,
  ],
  templateUrl: './familiares-form.component.html',
  styleUrls: ['./familiares-form.component.css'],
})
export class FamiliaresFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  familiaresArray: FormArray = FamiliarFormFactory.createArray(this.fb);
  cargando = false;

  autosaveStatuses: Record<number, AutosaveStatus> = {};
  mensajeBloqueoCambio?: string;
  readonly minBirthDate = MIN_BIRTH_DATE;
  readonly maxAdultDate = maxAdultBirthDate();

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;
  get familiaresGroups(): FormGroup[] {
    return this.familiaresArray.controls as FormGroup[];
  }

  puedeCambiarDePaso(): boolean {
    this.familiaresGroups.forEach((form) => form.markAllAsTouched());
    this.cdr.markForCheck();

    if (this.familiaresArray.length < 2) {
      this.mensajeBloqueoCambio =
        'Debes registrar dos referencias familiares antes de cambiar de pestaña.';
      return false;
    }

    if (!this.familiaresGroups.every((form) => form.valid)) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
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
          const idFamiliar = payload.id;
          delete payload.id;
          const otherRelationship = payload.other_relationship;
          delete payload.other_relationship;
          payload.details_payload = {
            ...(payload.details_payload ?? {}),
            ...(payload.relationship === 'OTHER'
              ? { other_relationship: otherRelationship?.trim() ?? '' }
              : {}),
          };
          if (payload.relationship !== 'OTHER') delete payload.details_payload.other_relationship;

          const request$ = idFamiliar
            ? this.api.actualizarFamiliar(idSolicitud, idFamiliar, payload, detalle.versionBloqueo)
            : this.api.crearFamiliar(idSolicitud, payload, detalle.versionBloqueo);

          return firstValueFrom(request$).then((res) => {
            // Update form with real ID if created
            if (!idFamiliar && res && res.id) {
              this.familiaresArray.at(index).patchValue({ id: res.id }, { emitEvent: false });
            }
            this.store.registrarAutoguardado(res);
            return res;
          });
        }),
      );
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarFamiliares();
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

  async cargarFamiliares() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarFamiliares(id));
      this.familiaresArray.clear();
      (data || []).forEach((familiar: any) => {
        const form = FamiliarFormFactory.create(this.fb);
        form.patchValue(familiar);
        form.patchValue({ other_relationship: familiar.details_payload?.other_relationship ?? '' });
        this.configurarParentescoOtro(form);
        this.familiaresArray.push(form);
      });
    } catch {
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  agregarFamiliar() {
    if (this.familiaresArray.length >= 2) return;
    const form = FamiliarFormFactory.create(this.fb);
    this.configurarParentescoOtro(form);
    this.familiaresArray.push(form);
    this.cdr.markForCheck();
  }

  esOtro(form: FormGroup): boolean {
    return form.controls['relationship'].value === 'OTHER';
  }

  private configurarParentescoOtro(form: FormGroup): void {
    const otherRelationship = form.controls['other_relationship'];
    form.controls['relationship'].valueChanges.subscribe(() => {
      if (form.controls['relationship'].value === 'OTHER') {
        otherRelationship.setValidators([Validators.required, Validators.maxLength(80)]);
      } else {
        otherRelationship.setValidators([Validators.maxLength(80)]);
        otherRelationship.setValue('', { emitEvent: false });
      }
      otherRelationship.updateValueAndValidity({ emitEvent: false });
      this.cdr.markForCheck();
    });
    if (form.controls['relationship'].value === 'OTHER') {
      otherRelationship.setValidators([Validators.required, Validators.maxLength(80)]);
    }
    otherRelationship.updateValueAndValidity({ emitEvent: false });
  }

  removerFamiliarVisual(index: number) {
    this.familiaresArray.removeAt(index);
    delete this.autosaveStatuses[index];
    this.cdr.markForCheck();
  }

  async eliminarFamiliarAPI(index: number, idFamiliar: string) {
    const confirmacion = await this.confirmation.confirm({
      title: 'Eliminar familiar',
      message: 'La persona se eliminará de la sección familiar del expediente.',
      confirmLabel: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await this.api
        .eliminarFamiliar(idSolicitud, idFamiliar, this.store.detalle()!.versionBloqueo)
        .toPromise();
      this.removerFamiliarVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch {
    } finally {
      this.cdr.markForCheck();
    }
  }
}
