import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, output, signal } from '@angular/core';
import { EvidenciaVerificacion } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { VerificacionDistribuidorasApiService } from '../../data-access/api/verificacion-distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { AttachmentPreviewModalComponent } from '../../../../shared/components/media/attachment-preview-modal/attachment-preview-modal.component';

@Component({
  selector: 'app-galeria-evidencias',
  standalone: true,
  imports: [DatePipe, AttachmentPreviewModalComponent],
  templateUrl: './galeria-evidencias.component.html',
  styleUrl: './galeria-evidencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaleriaEvidenciasComponent implements OnDestroy {
  private readonly confirmation = inject(ConfirmationService);
  private readonly api = inject(VerificacionDistribuidorasApiService);
  private readonly mediaApi = inject(MediaApiService);
  private readonly previewUrls = signal<Record<string, string>>({});
  private readonly previewIdsLoading = new Set<string>();
  protected readonly evidenciaAbiertaId = signal<string | null>(null);
  evidencias = input<EvidenciaVerificacion[]>([]);
  permitirEliminar = input<boolean>(false);
  permitirDescargar = input<boolean>(true);
  isProcessing = input<boolean>(false);
  descargaPrivada = input<boolean>(false);

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

  protected imagenesDisponibles(): EvidenciaVerificacion[] {
    return this.evidencias().filter((evidencia) => Boolean(this.vistaPrevia(evidencia.id)));
  }

  protected evidenciaAbierta(): EvidenciaVerificacion | null {
    return this.imagenesDisponibles().find((evidencia) => evidencia.id === this.evidenciaAbiertaId()) ?? null;
  }

  protected abrirVistaPrevia(evidenciaId: string): void {
    if (this.vistaPrevia(evidenciaId)) this.evidenciaAbiertaId.set(evidenciaId);
  }

  protected moverVistaPrevia(delta: number): void {
    const imagenes = this.imagenesDisponibles();
    if (!imagenes.length) return;
    const indice = imagenes.findIndex((evidencia) => evidencia.id === this.evidenciaAbiertaId());
    this.evidenciaAbiertaId.set(imagenes[(indice + delta + imagenes.length) % imagenes.length].id);
  }

  protected tipoArchivo(mimeType: string): string {
    return mimeType.split('/')[1]?.toUpperCase() || 'Imagen';
  }

  private async cargarVistasPrevias(evidencias: EvidenciaVerificacion[]): Promise<void> {
    for (const evidencia of evidencias) {
      if (this.previewUrls()[evidencia.id] || this.previewIdsLoading.has(evidencia.id)) continue;

        this.previewIdsLoading.add(evidencia.id);
      try {
        const blob = await firstValueFrom(this.descargaPrivada()
          ? this.mediaApi.preview(evidencia.id)
          : this.api.previsualizarEvidencia('', evidencia.id));
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
