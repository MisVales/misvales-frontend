import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfiguracionesStore } from '../../state/configurations.store';
import { ConfiguracionDTO } from '../../data-access/configurations.dtos';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-configuration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration-form.component.html',
  styleUrls: ['./configuration-form.component.css']
})
export class ConfiguracionFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(ConfiguracionesStore);

  // Input from parent or route resolver, if it's a new version for an existing config
  configuracionActual = input<ConfiguracionDTO | null>(null);
  
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
    const actual = this.configuracionActual();
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
    const actual = this.configuracionActual();
    
    if (!actual) return;

    // Convertir a DateTime en zona America/Monterrey
    // input type="datetime-local" nos da 'YYYY-MM-DDTHH:mm' (en local browser time conceptual)
    // Lo parseamos considerando que el usuario tecleó esa hora pensando en Monterrey.
    let dt = DateTime.fromISO(val.inicioVigencia, { zone: 'America/Monterrey' });
    
    if (!dt.isValid) {
      console.error('Fecha inválida');
      return;
    }

    const payload = {
      valor: val.valor.toString(),
      inicioVigencia: dt.toISO() as string, // ISO string con el offset correcto
      motivo: val.motivo
    };

    if (actual.estado === 'borrador' && actual.proximaVersionId) {
      this.store.modificarBorrador(actual.proximaVersionId, payload, actual.versionRegistro);
    } else {
      this.store.crearVersion({
        clave: actual.clave,
        ...payload
      });
    }
  }

  onCancel() {
    this.form.reset();
    this.store.limpiarStore();
    this.router.navigate(['/configuraciones']);
  }
}
