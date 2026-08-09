import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormFactory } from '../../forms/datos-personales-form.factory';
import { ResumenSolicitante } from '../../models/solicitud-distribuidora.model';

@Component({
  selector: 'app-datos-personales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './datos-personales-form.component.html',
  styleUrls: ['./datos-personales-form.component.css']
})
export class DatosPersonalesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);

  form: FormGroup = DatosPersonalesFormFactory.create(this.fb);
  
  // View states
  isCurpMasked = false;
  isRfcMasked = false;
  guardadoExitoso = false;

  ngOnInit() {
    this.cargarDatosActuales();
  }

  cargarDatosActuales() {
    const solicitante = this.store.detalle()?.solicitante;
    if (solicitante) {
      this.form.patchValue({
        first_name: solicitante.nombre,
        first_last_name: solicitante.apellidoPaterno,
        second_last_name: solicitante.apellidoMaterno,
        curp: solicitante.curpEnmascarada
      });
      
      if (solicitante.curpEnmascarada && solicitante.curpEnmascarada.includes('*')) {
         this.isCurpMasked = true;
      }
      this.guardadoExitoso = true;
    }
  }

  editarCurp() {
    this.isCurpMasked = false;
    this.form.get('curp')?.setValue('');
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Preparar payload, omitir curp si está enmascarada
    const rawValue = this.form.value;
    const payload: any = { ...rawValue };
    
    if (this.isCurpMasked) {
      delete payload.curp;
    }
    if (this.isRfcMasked) {
      delete payload.rfc;
    }

    // Normalizar espacios antes de enviar (regla de negocio del documento)
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim().replace(/\s+/g, ' ');
      }
    });

    try {
      await this.store.guardarDatosPersonales(payload);
      this.form.markAsPristine();
      this.guardadoExitoso = true;
    } catch (e) {
      // Error handled by store
    }
  }
}

