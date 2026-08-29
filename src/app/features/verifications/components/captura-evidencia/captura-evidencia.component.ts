import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { AttachmentPreviewComponent } from '../../../../shared/components/media/attachment-preview/attachment-preview.component';
import {
  VERIFICATION_EVIDENCE_FILE_RULE,
  validateUploadFile,
} from '../../../../shared/utils/files/file-validation';

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
  tiposPermitidos = input<{ id: string; label: string }[]>([]);
  maxSizeMB = input<number>(10);
  isUploading = input<boolean>(false);
  progress = input<number>(0);

  fileSelected = output<EvidenciaPayload>();

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  tipoSeleccionado = signal<string>('');
  archivoSeleccionado = signal<File | null>(null);
  errorMsg = signal<string | null>(null);

  onTipoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.tipoSeleccionado.set(select.value);
    this.errorMsg.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorMsg.set(null);

    if (!file) {
      this.limpiarArchivo();
      return;
    }

    const validationError = validateUploadFile(file, {
      ...VERIFICATION_EVIDENCE_FILE_RULE,
      maxBytes: this.maxSizeMB() * 1024 * 1024,
    });
    if (validationError) {
      this.errorMsg.set(validationError);
      this.limpiarArchivo();
      return;
    }

    this.archivoSeleccionado.set(file);
  }

  subirEvidencia(): void {
    if (!this.tipoSeleccionado()) {
      this.errorMsg.set('Debes seleccionar el tipo de evidencia.');
      return;
    }

    const file = this.archivoSeleccionado();
    if (!file) {
      this.errorMsg.set('Debes capturar una fotografía o seleccionar un archivo.');
      return;
    }

    const validationError = validateUploadFile(file, {
      ...VERIFICATION_EVIDENCE_FILE_RULE,
      maxBytes: this.maxSizeMB() * 1024 * 1024,
    });
    if (validationError) {
      this.errorMsg.set(validationError);
      this.limpiarArchivo();
      return;
    }

    this.fileSelected.emit({ tipo: this.tipoSeleccionado(), file });
  }

  limpiarArchivo(): void {
    this.archivoSeleccionado.set(null);
    const input = this.fileInput();
    if (input) {
      input.nativeElement.value = '';
    }
  }

  cancelar(): void {
    this.limpiarArchivo();
    this.tipoSeleccionado.set('');
    this.errorMsg.set(null);
  }
}
