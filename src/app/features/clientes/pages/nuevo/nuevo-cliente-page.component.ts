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
        last_name_1: ['', Validators.required],
        last_name_2: [''],
        curp: ['', [Validators.required, curpValidator()]],
        rfc: ['', Validators.required],
        birth_place: ['', Validators.required],
        official_id: ['', Validators.required]
      }),
      domicilio: this.fb.group({
        street: ['', Validators.required],
        neighborhood: ['', Validators.required],
        zip_code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        city: ['', Validators.required],
        state: ['', Validators.required]
      }),
      documentos: this.fb.group({
        identificacionFile: [null, Validators.required],
        comprobanteFile: [null, Validators.required]
      }),
      cuentaBancaria: this.fb.group({
        bank_name: [''],
        account_holder: [''],
        clabe: ['', Validators.pattern(/^\d{18}$/)]
      })
    });
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
      const request: CreateClientRequestDto = {
        first_name: val.identidad.first_name,
        last_name_1: val.identidad.last_name_1,
        last_name_2: val.identidad.last_name_2,
        curp: val.identidad.curp,
        rfc: val.identidad.rfc,
        birth_place: val.identidad.birth_place,
        birth_date: '1990-01-01', // Mock or add to form
        official_id: val.identidad.official_id,
        address: {
          street: val.domicilio.street,
          exterior_number: 'SN', // Mock or add to form
          interior_number: null,
          neighborhood: val.domicilio.neighborhood,
          zip_code: val.domicilio.zip_code,
          city: val.domicilio.city,
          municipality: val.domicilio.city,
          state: val.domicilio.state,
          country: 'MX'
        },
        bank_account: val.cuentaBancaria.clabe ? val.cuentaBancaria : undefined
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
