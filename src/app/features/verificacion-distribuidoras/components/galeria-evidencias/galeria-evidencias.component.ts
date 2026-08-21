import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, output, signal } from '@angular/core';
import { EvidenciaVerificacion } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { VerificacionDistribuidorasApiService } from '../../data-access/api/verificacion-distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-galeria-evidencias',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './galeria-evidencias.component.html',
  styleUrl: './galeria-evidencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaleriaEvidenciasComponent implements OnDestroy {
  private readonly confirmation = inject(ConfirmationService);
  private readonly api = inject(VerificacionDistribuidorasApiService);
  private readonly previewUrls = signal<Record<string, string>>({});
  private readonly previewIdsLoading = new Set<string>();
  evidencias = input<EvidenciaVerificacion[]>([]);
  permitirEliminar = input<boolean>(false);
  permitirDescargar = input<boolean>(true);
  isProcessing = input<boolean>(false);

  download = output<string>(); // emits evidenciaId
  delete = output<string>();   // emits evidenciaId

  // To map evidence type ids to readable labels
  tiposPermitidos = input<{id: string; label: string}[]>([]);

  constructor() {
    effect(() => {
      const imagenes = this.evidencias().filter((evidencia) => evidencia.mimeType.startsWith('image/'));
      void this.cargarVistasPrevias(imagenes);
    });
  }

  ngOnDestroy(): void {
    Object.values(this.previewUrls()).forEach((url) => URL.revokeObjectURL(url));
  }

  getTipoLabel(tipoId: string): string {
    const found = this.tiposPermitidos().find(t => t.id === tipoId);
    return found ? found.label : tipoId;
  }

  vistaPrevia(evidenciaId: string): string | null {
    return this.previewUrls()[evidenciaId] ?? null;
  }

  private async cargarVistasPrevias(evidencias: EvidenciaVerificacion[]): Promise<void> {
    for (const evidencia of evidencias) {
      if (this.previewUrls()[evidencia.id] || this.previewIdsLoading.has(evidencia.id)) continue;

      this.previewIdsLoading.add(evidencia.id);
      try {
        const blob = await firstValueFrom(this.api.descargarEvidencia('', evidencia.id));
        const url = URL.createObjectURL(blob);
        this.previewUrls.update((actuales) => ({ ...actuales, [evidencia.id]: url }));
      } catch {
        // La tarjeta sigue mostrando los datos y permite descargar la evidencia.
      } finally {
        this.previewIdsLoading.delete(evidencia.id);
      }
    }
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
