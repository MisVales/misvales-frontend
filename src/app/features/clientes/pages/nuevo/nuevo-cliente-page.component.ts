import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientesApiService } from '../../data-access/api/clientes-api.service';
import { CreateClientRequestDto } from '../../data-access/dtos/create-client-request.dto';
import { curpValidator } from '../../validators/curp.validators';
import { ClientesStore } from '../../state/clientes.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-nuevo-cliente-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nuevo-cliente-page.component.html',
  styleUrls: ['./nuevo-cliente-page.component.css']
})
export class NuevoClientePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ClientesApiService);
  private router = inject(Router);
  store = inject(ClientesStore);

  currentStep = 1;
  totalSteps = 5;

  form: FormGroup;
  enviando = false;
  errorEnvio: string | null = null;

  constructor() {
    this.form = this.fb.group({
      identidad: this.fb.group({
        first_name: ['', Validators.required],
        first_last_name: ['', Validators.required],
        second_last_name: [''],
        curp: ['', [Validators.required, curpValidator()]],
        rfc: ['', Validators.required],
        birth_date: ['', Validators.required],
        birth_place: ['', Validators.required],
        birth_state: ['', Validators.required],
        birth_city: ['', Validators.required],
        official_id_type: ['INE', Validators.required],
        official_id_number: ['']
      }),
      domicilio: this.fb.group({
        street: ['', Validators.required],
        neighborhood: ['', Validators.required],
        exterior_number: ['', Validators.required],
        interior_number: [''],
        postal_code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        municipality: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required]
      }),
      documentos: this.fb.group({
        identificacionFile: [null, Validators.required],
        comprobanteFile: [null, Validators.required]
      }),
      cuentaBancaria: this.fb.group({
        bank_name: ['', Validators.required],
        account_holder_name: ['', Validators.required],
        account_number: ['', Validators.pattern(/^\d{4,30}$/)],
        clabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]]
      })
    });
  }

  seleccionarArchivo(control: 'identificacionFile' | 'comprobanteFile', event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.get(`documentos.${control}`)?.setValue(file);
    this.form.get(`documentos.${control}`)?.markAsTouched();
  }

  ngOnInit() {
    // Al escribir en CURP, auto-convertir a mayúsculas
    this.form.get('identidad.curp')?.valueChanges.subscribe(val => {
      if (val && typeof val === 'string' && val !== val.toUpperCase()) {
        this.form.get('identidad.curp')?.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validar step actual antes de avanzar
      let valid = true;
      if (this.currentStep === 1) valid = this.form.get('identidad')!.valid;
      if (this.currentStep === 2) valid = this.form.get('domicilio')!.valid;
      if (this.currentStep === 3) valid = this.form.get('documentos')!.valid;
      if (this.currentStep === 4) valid = this.form.get('cuentaBancaria')!.valid;
      
      if (valid) {
        this.currentStep++;
      } else {
        this.markStepAsTouched(this.currentStep);
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private markStepAsTouched(step: number) {
    if (step === 1) this.form.get('identidad')?.markAllAsTouched();
    if (step === 2) this.form.get('domicilio')?.markAllAsTouched();
    if (step === 3) this.form.get('documentos')?.markAllAsTouched();
    if (step === 4) this.form.get('cuentaBancaria')?.markAllAsTouched();
  }

  async confirmar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.errorEnvio = null;

    try {
      const val = this.form.value;
      const identificacion = await firstValueFrom(this.api.subirDocumento(val.documentos.identificacionFile, 'OFFICIAL_ID'));
      const comprobante = await firstValueFrom(this.api.subirDocumento(val.documentos.comprobanteFile, 'ADDRESS_PROOF'));
      const request: CreateClientRequestDto = {
        first_name: val.identidad.first_name,
        first_last_name: val.identidad.first_last_name,
        second_last_name: val.identidad.second_last_name,
        curp: val.identidad.curp,
        rfc: val.identidad.rfc,
        birth_place: val.identidad.birth_place,
        birth_date: val.identidad.birth_date,
        birth_state: val.identidad.birth_state,
        birth_city: val.identidad.birth_city,
        official_id_type: val.identidad.official_id_type,
        official_id_number: val.identidad.official_id_number,
        official_id_media_id: identificacion.id,
        address: {
          street: val.domicilio.street,
          exterior_number: val.domicilio.exterior_number,
          interior_number: val.domicilio.interior_number || null,
          neighborhood: val.domicilio.neighborhood,
          postal_code: val.domicilio.postal_code,
          city: val.domicilio.city,
          municipality: val.domicilio.municipality,
          state: val.domicilio.state,
          country: 'MX',
          address_proof_media_id: comprobante.id
        },
        bank_account: val.cuentaBancaria
      };

      const idempotencyKey = crypto.randomUUID();
      const res = await firstValueFrom(this.store.crearCliente(request, idempotencyKey));
      
      alert('Cliente creado exitosamente');
      this.router.navigate(['/clientes', res.id]);
    } catch (e: any) {
      this.errorEnvio = this.store.error() || 'Ocurrió un error al registrar al cliente.';
    } finally {
      this.enviando = false;
    }
  }
}
