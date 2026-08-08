import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';

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

  dictamen = signal<'COMPLIES' | 'DOES_NOT_COMPLY' | null>(null);
  motivo = signal<string>('');

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
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (!this.dictamen()) {
      alert('Debes seleccionar un dictamen.');
      return;
    }

    if (!this.motivo()) {
      alert('Debes proporcionar un motivo para tu dictamen.');
      return;
    }
    
    // Additional logic validation: If visit was unfavorable, cannot comply
    if (this.dictamen() === 'COMPLIES') {
      const isUnfavorable = solicitud.visitas.some(v => v.resultadoFisico === 'UNFAVORABLE');
      if (isUnfavorable) {
        alert('No puedes dictaminar como "Cumple" si la visita física fue desfavorable.');
        return;
      }
    }

    if (!confirm('¿Estás seguro de enviar esta evaluación? Esta decisión es definitiva y pasará a autorización gerencial si es favorable.')) {
      return;
    }

    const req = {
      dictamen: this.dictamen()!,
      motivo: this.motivo(),
      lock_version: solicitud.lockVersion
    };

    const success = await this.facade.evaluarSolicitud(solicitud.id, req);
    if (success) {
      alert('Evaluación registrada con éxito.');
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
