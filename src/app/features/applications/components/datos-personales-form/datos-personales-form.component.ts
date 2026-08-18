import { Component, inject, OnInit, Input, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormFactory } from '../../forms/datos-personales-form.factory';
import { ResumenSolicitante } from '../../models/solicitud-distribuidora.model';
import { AutosaveDirective, AutosaveStatus } from '../../../../core/forms/autosave.directive';
import { from, Observable } from 'rxjs';
import { MediaApiService } from '../../../../core/services/media-api.service';

@Component({
  selector: 'app-datos-personales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutosaveDirective],
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
      if (detalle && detalle.solicitante) {
        this.cargarDatosActuales(detalle.solicitante);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    // Removido, ahora se hace por medio de effect()
  }

  cargarDatosActuales(solicitante: ResumenSolicitante) {
    // Determine initial values for backend-stored fields
    // Assuming the backend has nationality or other fields returned (not currently in ResumenSolicitanteDTO unless added)
    // For now we patch what we have.
    this.form.patchValue({
      first_name: solicitante.nombre,
      first_last_name: solicitante.apellidoPaterno,
      second_last_name: solicitante.apellidoMaterno,
      curp: solicitante.curpEnmascarada
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
          this.evidenceError = err.error?.message || 'Error al subir la evidencia';
          this.form.get('evidence_uploaded')?.setValue(false);
          this.cdr.markForCheck();
        }
      });
    }
  }
}
