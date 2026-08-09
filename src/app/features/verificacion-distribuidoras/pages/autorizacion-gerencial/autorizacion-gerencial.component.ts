import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';

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

  decision = signal<'AUTORIZADA' | 'RECHAZADA' | null>(null);
  comentarios = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy(): void {
    this.facade.limpiarSeleccion();
  }

  async onAuthorize(): Promise<void> {
    const solicitud = this.facade.solicitudSeleccionada();
    const decision = this.decision();
    if (!solicitud || !decision) {
      alert('Debes seleccionar una decisión.');
      return;
    }

    if (!this.comentarios().trim()) {
      alert('Es obligatorio proporcionar el motivo de la decisión.');
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de emitir el dictamen final como ${decision}? Esta acción cierra el proceso.`,
      )
    ) {
      return;
    }

    const success = await this.facade.autorizarSolicitud(solicitud.id, {
      decision,
      motivo: this.comentarios().trim(),
      lock_version: solicitud.lockVersion,
    });

    if (success) {
      alert(
        'Decisión gerencial registrada. El Módulo 5 ha finalizado sin activar la distribuidora.',
      );
      await this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  onCancel(): void {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      void this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }
}
