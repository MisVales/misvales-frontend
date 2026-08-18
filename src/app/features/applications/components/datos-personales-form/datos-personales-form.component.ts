import { Component, inject, OnInit, Input, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormFactory } from '../../forms/datos-personales-form.factory';
import { ResumenSolicitante } from '../../models/solicitud-distribuidora.model';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-datos-personales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './datos-personales-form.component.html',
  styleUrls: ['./datos-personales-form.component.css']
})
export class DatosPersonalesFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);

  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = DatosPersonalesFormFactory.create(this.fb);
  
  // View states
  isCurpMasked = false;
  isRfcMasked = false;
  guardadoExitoso = false;

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
    this.form.patchValue({
      first_name: solicitante.nombre,
      first_last_name: solicitante.apellidoPaterno,
      second_last_name: solicitante.apellidoMaterno,
      curp: solicitante.curpEnmascarada
    }, { emitEvent: false });
    
    if (solicitante.curpEnmascarada && solicitante.curpEnmascarada.includes('*')) {
       this.isCurpMasked = true;
    }
    
    // Si ya tiene curp, probablemente ya se guardó una vez (borrador parcial)
    if (solicitante.curpEnmascarada) {
      this.guardadoExitoso = true;
    }
    
    // Al parchear valores desde un effect asíncrono, si estamos zoneless, 
    // cdr.markForCheck() podría ser necesario dependiendo de cómo se actualice la vista.
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
    } finally {
      this.cdr.markForCheck();
    }
  }
}

