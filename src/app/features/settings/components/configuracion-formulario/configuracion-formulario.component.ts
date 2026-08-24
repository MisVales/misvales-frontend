import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import { ConfiguracionDefinicion, ConfiguracionVersion } from '../../data-access/configuraciones.dtos';
import { DateTime } from 'luxon';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';

@Component({
  selector: 'app-configuracion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './configuracion-formulario.component.html',
  styleUrls: ['./configuracion-formulario.component.css']
})
export class ConfiguracionFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(ConfiguracionesStore);

  configuracionDefinicion = input<ConfiguracionDefinicion | null>(null);
  configuracionVersion = input<ConfiguracionVersion | null>(null);
  
  form: FormGroup;
  impactaSistema: boolean = false;

  constructor() {
    this.form = this.fb.group({
      valor: ['', [Validators.required]],
      inicioVigencia: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    const actual = this.configuracionDefinicion();
    if (actual) {
      this.impactaSistema = ['CFG_MAX_CRED', 'CFG_INT_BASE', 'CFG_REC_TARDE', 'CFG_DIAS_GRACIA', 'CFG_HORA_CIERRE'].includes(actual.clave);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const val = this.form.value;
    const definicion = this.configuracionDefinicion();
    const version = this.configuracionVersion();
    
    if (!definicion) return;

    let dt = DateTime.fromISO(val.inicioVigencia, { zone: 'America/Monterrey' });
    
    if (!dt.isValid) {
      return;
    }

    const payload = {
      value: val.valor.toString(),
      effective_from: dt.toISO() as string,
      reason: val.motivo
    };

    if (version && version.estado === 'DRAFT') {
      this.store.modificarVersion(version.id, {
        ...payload,
        lock_version: version.versionRegistro
      });
    } else {
      this.store.crearVersion(definicion.clave, payload);
    }
  }

  onCancel() {
    this.form.reset();
    this.store.limpiarStore();
    this.router.navigate(['/configuraciones']);
  }
}
