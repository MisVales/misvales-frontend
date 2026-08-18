import { Component, inject, OnInit, effect, ChangeDetectorRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormFactory } from '../../forms/datos-personales-form.factory';
import { curpValidator } from '../../validators/curp.validator';
import { ResumenSolicitante } from '../../models/solicitud-distribuidora.model';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';
import { from, Observable } from 'rxjs';
import { MediaApiService } from '../../../../core/services/media-api.service';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api/api-error';
import { ISO_COUNTRIES } from '../../../../shared/data/iso-countries';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';

@Component({
  selector: 'app-datos-personales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AutosaveDirective, ApplicationFormErrorStateDirective],
  templateUrl: './datos-personales-form.component.html',
  styleUrls: ['./datos-personales-form.component.css']
})
export class DatosPersonalesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);

  private cdr = inject(ChangeDetectorRef);
  private mediaApi = inject(MediaApiService);

  form: FormGroup = DatosPersonalesFormFactory.create(this.fb);
  
  // View states
  isCurpMasked = false;
  isRfcMasked = false;
  uploadingEvidence = false;
  evidenceError: string | null = null;
  private datosInicialesCargados = false;
  
  autosaveStatus: AutosaveStatus = 'idle';
  mensajeBloqueoCambio?: string;
  mostrarErroresDeValidacion = false;
  readonly countries = ISO_COUNTRIES;
  readonly maxAdultDate: string = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  @ViewChildren(AutosaveDirective)
  private autoguardados!: QueryList<AutosaveDirective>;

  saveFn = (rawValue: any): Observable<any> => {
    const payload: any = { ...rawValue };
    
    // Remove local view tracking props
    delete payload.evidence_uploaded;

    if (this.isCurpMasked) {
      delete payload.curp;
    }
    if (this.isRfcMasked) {
      delete payload.rfc;
    }

    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim().replace(/\s+/g, ' ');
      }
    });

    return from(this.store.guardarDatosPersonales(payload));
  };

  constructor() {
    // Escuchar los cambios en detalle() para reaccionar asíncronamente
    effect(() => {
      const detalle = this.store.detalle();
      if (detalle && detalle.datosPersonales && !this.datosInicialesCargados && !this.form.dirty) {
        this.cargarDatosActuales(detalle.datosPersonales);
        this.datosInicialesCargados = true;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.form.controls['nationality'].valueChanges.subscribe((nationality) => {
      this.configurarValidacionCurp(nationality);
      this.configurarValidacionPaisIdentificacion(nationality);

      if (nationality === 'FOREIGN') {
        this.form.patchValue({ birth_country: '', identification_country: '' });
      } else if (nationality === 'MEXICAN') {
        this.form.patchValue({ birth_country: 'MX', identification_country: 'MX' });
      }
    });
  }

  cargarDatosActuales(solicitante: ResumenSolicitante | any) {
    const nationality = solicitante.nationality ?? 'MEXICAN';

    this.form.patchValue({
      nationality,
      first_name: solicitante.first_name ?? solicitante.nombre,
      first_last_name: solicitante.first_last_name ?? solicitante.apellidoPaterno,
      second_last_name: solicitante.second_last_name ?? solicitante.apellidoMaterno,
      curp: solicitante.curp ?? solicitante.curp_masked ?? solicitante.curpEnmascarada,
      rfc: solicitante.rfc ?? '',
      birth_country: solicitante.birth_country ?? 'MX',
      birth_date: solicitante.birth_date ?? '',
      birth_state: solicitante.birth_state ?? '',
      birth_city: solicitante.birth_city ?? '',
      email: solicitante.email ?? '',
      phone_number: solicitante.phone_number ?? '',
      // El API deja este dato en null para mexicanos y el campo está oculto.
      // Conservarlo así evita invalidar un formulario ya completo.
      identification_country: solicitante.identification_country ?? null,
      official_id_type: solicitante.official_id_type ?? '',
      official_id_number: solicitante.official_id_number ?? '',
      evidence_uploaded: solicitante.has_identification_evidence === true,
    }, { emitEvent: false });
    this.configurarValidacionCurp(nationality);
    this.configurarValidacionPaisIdentificacion(nationality);
    
    const curpEnmascarada = solicitante.curp_masked ?? solicitante.curpEnmascarada;
    this.isCurpMasked = typeof curpEnmascarada === 'string' && curpEnmascarada.includes('*');
    this.isRfcMasked = typeof solicitante.rfc_masked === 'string' && solicitante.rfc_masked.includes('*');
  }

  editarCurp() {
    this.isCurpMasked = false;
    this.form.get('curp')?.setValue('');
  }

  /** Evita desmontar la sección mientras hay datos inválidos o un archivo en carga. */
  puedeCambiarDePaso(): boolean {
    if (this.uploadingEvidence) {
      this.mensajeBloqueoCambio = 'Espere a que termine de subir la evidencia antes de cambiar de pestaña.';
      this.evidenceError = 'Espere a que termine de subir la evidencia antes de cambiar de pestaña.';
      this.cdr.markForCheck();
      return false;
    }

    if (this.form.invalid) {
      this.mensajeBloqueoCambio = 'Corrige los campos marcados antes de cambiar de pestaña.';
      this.mostrarErroresDeValidacion = true;
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
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

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.touched || this.mostrarErroresDeValidacion);
  }

  private configurarValidacionCurp(nationality: string): void {
    const curp = this.form.controls['curp'];
    curp.setValidators(nationality === 'MEXICAN' ? [Validators.required, curpValidator()] : [curpValidator()]);
    curp.updateValueAndValidity({ emitEvent: false });
  }

  private configurarValidacionPaisIdentificacion(nationality: string): void {
    const identificationCountry = this.form.controls['identification_country'];
    const validators = [Validators.maxLength(2)];

    if (nationality === 'FOREIGN') {
      validators.unshift(Validators.required);
    }

    identificationCountry.setValidators(validators);
    identificationCountry.updateValueAndValidity({ emitEvent: false });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const applicationId = this.store.detalle()?.id;
      if (!applicationId) return;

      this.uploadingEvidence = true;
      this.evidenceError = null;
      this.cdr.markForCheck();

      this.mediaApi.upload({
        file: file,
        owner_type: 'distributor_application',
        owner_id: applicationId,
        purpose: 'IDENTIFICATION'
      }).subscribe({
        next: () => {
          this.uploadingEvidence = false;
          this.form.get('evidence_uploaded')?.setValue(true);
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.uploadingEvidence = false;
          this.evidenceError = apiValidationErrors(err)['file']?.[0] ?? apiErrorMessage(err, 'No fue posible subir la evidencia.');
          this.form.get('evidence_uploaded')?.setValue(false);
          this.cdr.markForCheck();
        }
      });
    }
  }
}
