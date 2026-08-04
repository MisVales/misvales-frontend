import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { EvidenciaVerificacion } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-galeria-evidencias',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './galeria-evidencias.component.html',
  styleUrl: './galeria-evidencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaleriaEvidenciasComponent {
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

  onDelete(id: string) {
    if (this.permitirEliminar() && !this.isProcessing()) {
      if (confirm('¿Estás seguro de que deseas eliminar esta evidencia?')) {
        this.delete.emit(id);
      }
    }
  }
}
