import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';

@Component({
  selector: 'app-evaluacion-coordinador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './evaluacion-coordinador.component.html',
  styleUrl: './evaluacion-coordinador.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluacionCoordinadorComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);

  dictamen = signal<'COMPLIES' | 'DOES_NOT_COMPLY' | null>(null);
  motivo = signal<string>('');
  submitted = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  async onEvaluate() {
    this.submitted.set(true);
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (!this.dictamen()) {
      this.alerts.showAlert('Selecciona un dictamen de coordinación.', 'warning');
      return;
    }

    if (!this.motivo()) {
      this.alerts.showAlert('El motivo del dictamen es obligatorio.', 'warning');
      return;
    }
    
    // Additional logic validation: If visit was unfavorable, cannot comply
    if (this.dictamen() === 'COMPLIES') {
      const isUnfavorable = solicitud.visitas.some(v => v.resultadoFisico === 'UNFAVORABLE');
      if (isUnfavorable) {
        this.alerts.showAlert('No puedes dictaminar “Cumple” cuando la visita física fue desfavorable.', 'error');
        return;
      }
    }

    if (!await this.confirmation.confirm({ title: 'Enviar evaluación', message: 'La evaluación quedará registrada. Si es favorable, el expediente avanzará a autorización gerencial.', confirmLabel: 'Enviar evaluación' })) {
      return;
    }

    const req = {
      visit_id: solicitud.visitas.at(-1)?.id || '',
      dictamen: this.dictamen()!,
      motivo: this.motivo(),
      lock_version: solicitud.lockVersion
    };

    const success = await this.facade.evaluarSolicitud(solicitud.id, req);
    if (success) {
      this.alerts.showAlert('Evaluación de coordinación registrada.', 'success');
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
