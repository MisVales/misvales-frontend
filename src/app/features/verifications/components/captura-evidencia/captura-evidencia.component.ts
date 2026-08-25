import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AttachmentPreviewComponent } from '../../../../shared/components/media/attachment-preview/attachment-preview.component';
import { CommonModule } from '@angular/common';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

export interface EvidenciaPayload {
  tipo: string;
  file: File;
}

@Component({
  selector: 'app-captura-evidencia',
  standalone: true,
  imports: [CommonModule, AttachmentPreviewComponent, RefactorSelectComponent],
  templateUrl: './captura-evidencia.component.html',
  styleUrl: './captura-evidencia.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapturaEvidenciaComponent {
  // Inputs
  tiposPermitidos = input<{ id: string; label: string }[]>([]);
  maxSizeMB = input<number>(10);
  isUploading = input<boolean>(false);
  progress = input<number>(0);

  // Outputs
  fileSelected = output<EvidenciaPayload>();

  // View Childs
  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // State
  tipoSeleccionado = signal<string>('');
  archivoSeleccionado = signal<File | null>(null);
  errorMsg = signal<string | null>(null);

  onTipoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.tipoSeleccionado.set(select.value);
    this.errorMsg.set(null);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorMsg.set(null);

    if (!file) {
      this.limpiarArchivo();
      return;
    }

    // Validate size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > this.maxSizeMB()) {
      this.errorMsg.set(`El archivo excede el tamaño máximo permitido de ${this.maxSizeMB()}MB.`);
      this.limpiarArchivo();
      return;
    }

    // Validate mime
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      this.errorMsg.set('Solo se permiten archivos JPG, PNG, WebP o PDF.');
      this.limpiarArchivo();
      return;
    }

    this.archivoSeleccionado.set(file);
  }

  subirEvidencia() {
    if (!this.tipoSeleccionado()) {
      this.errorMsg.set('Debes seleccionar el tipo de evidencia.');
      return;
    }

    const file = this.archivoSeleccionado();
    if (!file) {
      this.errorMsg.set('Debes capturar una fotografía o seleccionar un archivo.');
      return;
    }

    this.fileSelected.emit({ tipo: this.tipoSeleccionado(), file });
  }

  limpiarArchivo() {
    this.archivoSeleccionado.set(null);
    const input = this.fileInput();
    if (input) {
      input.nativeElement.value = '';
    }
  }

  cancelar() {
    this.limpiarArchivo();
    this.tipoSeleccionado.set('');
    this.errorMsg.set(null);
  }
}
