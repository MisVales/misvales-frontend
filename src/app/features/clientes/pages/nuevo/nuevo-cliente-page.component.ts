import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { curpValidator } from '../../validators/curp.validators';
import { ClientesStore } from '../../state/clientes.store';
import { CreateClientRequestDto } from '../../data-access/dtos/create-client-request.dto';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-nuevo-cliente-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputErrorComponent],
  templateUrl: './nuevo-cliente-page.component.html',
  styleUrls: ['./nuevo-cliente-page.component.css']
})
export class NuevoClientePageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  store = inject(ClientesStore);
  enviando = false;
  errorEnvio: string | null = null;

  form = this.fb.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    first_last_name: ['', [Validators.required, Validators.maxLength(100)]],
    second_last_name: ['', [Validators.maxLength(100)]],
    curp: ['', [Validators.required, curpValidator()]],
    rfc: ['', [Validators.pattern(/^([A-ZÑ&]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A])?$/)]],
    birth_date: ['', Validators.required],
    birth_place: ['', Validators.required],
    birth_state: ['', Validators.required],
    birth_city: ['', Validators.required],
    official_id_type: ['INE', Validators.required],
    official_id_number: [''],
    street: ['', Validators.required],
    exterior_number: ['', Validators.required],
    interior_number: [''],
    neighborhood: ['', Validators.required],
    postal_code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    municipality: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    bank_name: ['', Validators.required],
    account_holder_name: ['', Validators.required],
    account_number: ['', Validators.pattern(/^\d{4,30}$/)],
    clabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]]
  });

  constructor() {
    this.form.controls.curp.valueChanges.subscribe(v => {
      if (v && v !== v.toUpperCase()) {
        this.form.controls.curp.setValue(v.toUpperCase(), { emitEvent: false });
      }
    });
    this.form.controls.rfc.valueChanges.subscribe(v => {
      if (v && v !== v.toUpperCase()) {
        this.form.controls.rfc.setValue(v.toUpperCase(), { emitEvent: false });
      }
    });
  }

  async confirmar() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando = true;
    this.errorEnvio = null;
    const v = this.form.getRawValue();
    const request: CreateClientRequestDto = {
      first_name: v.first_name!,
      first_last_name: v.first_last_name!,
      second_last_name: v.second_last_name || null,
      curp: v.curp!,
      rfc: v.rfc || null,
      birth_date: v.birth_date!,
      birth_place: v.birth_place!,
      birth_state: v.birth_state!,
      birth_city: v.birth_city!,
      official_id_type: v.official_id_type as any,
      official_id_number: v.official_id_number || null,
      address: {
        street: v.street!,
        exterior_number: v.exterior_number!,
        interior_number: v.interior_number || null,
        neighborhood: v.neighborhood!,
        postal_code: v.postal_code!,
        municipality: v.municipality!,
        city: v.city!,
        state: v.state!,
        country: 'MX'
      },
      bank_account: {
        bank_name: v.bank_name!,
        account_holder_name: v.account_holder_name!,
        account_number: v.account_number || null,
        clabe: v.clabe!
      }
    };
    try {
      const res = await firstValueFrom(this.store.crearCliente(request, crypto.randomUUID()));
      await this.router.navigate(['/clientes', res.id]);
    } catch {
      this.errorEnvio = this.store.error() || 'No fue posible registrar al cliente.';
    } finally {
      this.enviando = false;
    }
  }
}
