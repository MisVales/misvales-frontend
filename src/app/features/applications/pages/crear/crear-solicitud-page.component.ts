import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';

@Component({
  selector: 'app-crear-solicitud-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-solicitud-page.component.html',
  styleUrls: ['./crear-solicitud-page.component.css']
})
export class CrearSolicitudPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(SolicitudDetalleStore);

  crearForm = this.fb.group({
    branch_id: ['', Validators.required],
    coordinator_id: ['', Validators.required]
  });

  async onSubmit() {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    try {
      const id = await this.store.crearSolicitud({
        branch_id: this.crearForm.value.branch_id!,
        coordinator_id: this.crearForm.value.coordinator_id!
      });
      // Redirect to detail
      this.router.navigate(['/solicitudes-distribuidoras', id]);
    } catch (e) {
      // Error handled by store
    }
  }

  cancelar() {
    this.router.navigate(['/solicitudes-distribuidoras']);
  }
}
