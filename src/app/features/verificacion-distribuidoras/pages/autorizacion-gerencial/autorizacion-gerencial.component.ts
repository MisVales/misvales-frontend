import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { StrictNumberInputDirective } from '../../../../shared/directives/strict-number-input.directive';

@Component({
  selector: 'app-autorizacion-gerencial',
  standalone: true,
  imports: [FormsModule, StrictNumberInputDirective],
  templateUrl: './autorizacion-gerencial.component.html',
  styleUrl: './autorizacion-gerencial.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutorizacionGerencialComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);

  decision = signal<'APPROVED' | 'REJECTED' | null>(null);
  comentarios = signal<string>('');
  submitted = signal(false);
  lineaInicial = signal<string>('');

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
    this.submitted.set(true);
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (!this.decision()) {
      this.alerts.showAlert('Selecciona una decisión gerencial.', 'warning');
      return;
    }

    if (this.decision() === 'REJECTED' && !this.comentarios()) {
      this.alerts.showAlert('El motivo de rechazo es obligatorio.', 'warning');
      return;
    }

    if (
      this.decision() === 'APPROVED' &&
      (!this.lineaInicial() || Number(this.lineaInicial()) <= 0)
    ) {
      this.alerts.showAlert('Introduce una línea inicial mayor que cero.', 'warning');
      return;
    }

    // Example logic rule
    if (
      this.decision() === 'APPROVED' &&
      solicitud.ultimaEvaluacion?.dictamen === 'DOES_NOT_COMPLY'
    ) {
      if (
        !(await this.confirmation.confirm({
          title: 'Dictámenes no coincidentes',
          message:
            'La evaluación de coordinación es desfavorable. Confirma que deseas continuar con una aprobación excepcional.',
          confirmLabel: 'Continuar con aprobación',
          tone: 'danger',
        }))
      ) {
        return;
      }
    }

    if (
      !(await this.confirmation.confirm({
        title: 'Emitir dictamen final',
        message: `Registrarás la solicitud como ${this.decision() === 'APPROVED' ? 'aprobada' : 'rechazada'}. Esta decisión cierra el proceso de verificación.`,
        confirmLabel: 'Emitir dictamen',
        tone: this.decision() === 'REJECTED' ? 'danger' : 'default',
      }))
    ) {
      return;
    }

    const comentarios = this.comentarios().trim();
    const motivoFinal = comentarios || (this.decision() === 'APPROVED' ? 'Aprobación gerencial' : '');

    const req = {
      decision: this.decision()!,
      motivo: motivoFinal,
      linea_inicial: this.decision() === 'APPROVED' ? this.lineaInicial() : null,
      lock_version: solicitud.lockVersion,
    };

    const success = await this.facade.autorizarSolicitud(solicitud.id, req);
    if (success) {
      this.alerts.showAlert(
        'Decisión gerencial registrada. El proceso de verificación finalizó.',
        'success',
      );
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }
}
