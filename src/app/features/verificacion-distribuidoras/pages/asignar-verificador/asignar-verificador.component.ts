import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asignar-verificador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asignar-verificador.component.html',
  styleUrl: './asignar-verificador.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignarVerificadorComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  verifierId = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
      this.facade.cargarVerificadoresDisponibles();
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  async onAssign() {
    if (!this.verifierId) {
      alert('Debes seleccionar un verificador.');
      return;
    }
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    const req = {
      verifier_id: this.verifierId,
      lock_version: solicitud.lockVersion
    };

    const success = await this.facade.asignarVerificador(solicitud.id, req);
    if (success) {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    } else {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora/revision']);
    }
  }
}
