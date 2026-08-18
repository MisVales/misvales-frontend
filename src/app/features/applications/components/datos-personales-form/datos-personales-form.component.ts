import { Component, inject, OnInit, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormFactory } from '../../forms/datos-personales-form.factory';
import { ResumenSolicitante } from '../../models/solicitud-distribuidora.model';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';
import { from, Observable } from 'rxjs';
import { MediaApiService } from '../../../../core/services/media-api.service';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api/api-error';
import { ISO_COUNTRIES } from '../../../../shared/data/iso-countries';

@Component({
  selector: 'app-datos-personales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent, AutosaveDirective],
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
  
  autosaveStatus: AutosaveStatus = 'idle';
  readonly countries = ISO_COUNTRIES;
  readonly maxAdultDate: string = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

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
      if (detalle && detalle.datosPersonales && !this.form.dirty) {
        this.cargarDatosActuales(detalle.datosPersonales);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.form.controls['nationality'].valueChanges.subscribe((nationality) => {
      if (nationality === 'FOREIGN') {
        this.form.patchValue({ birth_country: '', identification_country: '' });
      } else if (nationality === 'MEXICAN') {
        this.form.patchValue({ birth_country: 'MX', identification_country: 'MX' });
      }
    });
  }

  cargarDatosActuales(solicitante: ResumenSolicitante | any) {
    this.form.patchValue({
      nationality: solicitante.nationality ?? 'MEXICAN',
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
      identification_country: solicitante.identification_country ?? '',
      official_id_type: solicitante.official_id_type ?? '',
      official_id_number: solicitante.official_id_number ?? '',
    }, { emitEvent: false });
    
    if (solicitante.curpEnmascarada && solicitante.curpEnmascarada.includes('*')) {
       this.isCurpMasked = true;
    }
  }

  editarCurp() {
    this.isCurpMasked = false;
    this.form.get('curp')?.setValue('');
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
