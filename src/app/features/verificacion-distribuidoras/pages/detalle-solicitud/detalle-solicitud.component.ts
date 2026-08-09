import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LineaTiempoSolicitudComponent } from '../../components/linea-tiempo-solicitud/linea-tiempo-solicitud.component';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [DatePipe, RouterLink, EstadoSolicitudComponent, LineaTiempoSolicitudComponent],
  templateUrl: './detalle-solicitud.component.html',
  styleUrl: './detalle-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleSolicitudComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  protected readonly sessionStore = inject(SessionStore);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy(): void {
    this.facade.limpiarSeleccion();
  }

  get canAssign(): boolean {
    return this.hasPermission('verification.verifiers.assign');
  }

  get canCorrect(): boolean {
    return this.hasPermission('verification.corrections.manage');
  }

  get canEvaluate(): boolean {
    return this.hasPermission('verification.evaluations.decide');
  }

  get canAuthorize(): boolean {
    return this.hasPermission('verification.authorizations.decide');
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.sessionStore.permissions();
    return permissions.includes('all') || permissions.includes(permission);
  }
}
