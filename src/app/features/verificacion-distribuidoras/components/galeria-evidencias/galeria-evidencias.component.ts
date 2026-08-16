import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { EvidenciaVerificacion } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

@Component({
  selector: 'app-galeria-evidencias',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './galeria-evidencias.component.html',
  styleUrl: './galeria-evidencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaleriaEvidenciasComponent {
  private readonly confirmation = inject(ConfirmationService);
  evidencias = input<EvidenciaVerificacion[]>([]);
  permitirEliminar = input<boolean>(false);
  permitirDescargar = input<boolean>(true);
  isProcessing = input<boolean>(false);

  download = output<string>(); // emits evidenciaId
  delete = output<string>();   // emits evidenciaId

  // To map evidence type ids to readable labels
  tiposPermitidos = input<{id: string; label: string}[]>([]);

  getTipoLabel(tipoId: string): string {
    const found = this.tiposPermitidos().find(t => t.id === tipoId);
    return found ? found.label : tipoId;
  }

  onDownload(id: string) {
    if (this.permitirDescargar() && !this.isProcessing()) {
      this.download.emit(id);
    }
  }

  async onDelete(id: string) {
    if (this.permitirEliminar() && !this.isProcessing()) {
      if (await this.confirmation.confirm({ title: 'Eliminar evidencia', message: 'La evidencia se retirará del expediente de esta visita.', confirmLabel: 'Eliminar evidencia', tone: 'danger' })) {
        this.delete.emit(id);
      }
    }
  }
}
