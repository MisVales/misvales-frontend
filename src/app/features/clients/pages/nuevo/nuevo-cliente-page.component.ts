import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientesStore } from '../../state/clientes.store';
import { CreateClientRequestDto } from '../../data-access/dtos/create-client-request.dto';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { curpValidator } from '../../validators/curp.validators';

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
    curp: ['', [Validators.required, Validators.maxLength(18), curpValidator()]],
  });

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
      curp: v.curp!
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

  normalizeCurp(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18);
    if (input.value !== value) input.value = value;
    this.form.controls.curp.setValue(value);
  }
}
