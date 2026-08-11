import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autorizacion-gerencial',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './autorizacion-gerencial.component.html',
  styleUrl: './autorizacion-gerencial.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutorizacionGerencialComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  decision = signal<'APPROVED' | 'REJECTED' | null>(null);
  comentarios = signal<string>('');
  
  // Simulated manager credentials for double auth in a real world scenario
  password = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  async onAuthorize() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (!this.decision()) {
      alert('Debes seleccionar una decisión.');
      return;
    }
    
    if (this.decision() === 'REJECTED' && !this.comentarios()) {
      alert('Es obligatorio proporcionar un motivo de rechazo.');
      return;
    }

    // Example logic rule
    if (this.decision() === 'APPROVED' && solicitud.ultimaEvaluacion?.dictamen === 'DOES_NOT_COMPLY') {
      if (!confirm('Advertencia: El coordinador dictaminó esta solicitud como DESFAVORABLE. ¿Seguro que deseas APROBARLA?')) {
        return;
      }
    }

    if (!confirm(`¿Estás seguro de emitir el dictamen final como ${this.decision() === 'APPROVED' ? 'APROBADO' : 'RECHAZADO'}? Esta acción cierra el proceso.`)) {
      return;
    }

    const req = {
      decision: this.decision()!,
      motivo: this.comentarios(),
      lock_version: solicitud.lockVersion
    };

    const success = await this.facade.autorizarSolicitud(solicitud.id, req);
    if (success) {
      alert('Decisión gerencial registrada. Proceso de verificación finalizado.');
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    }
  }
}
