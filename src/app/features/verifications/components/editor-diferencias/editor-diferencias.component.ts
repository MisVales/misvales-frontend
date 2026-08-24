import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

export interface DiferenciaPayload {
  seccion: string;
  campo: string;
  datoDeclarado: string;
  datoObservado: string;
  descripcion: string;
}

@Component({
  selector: 'app-editor-diferencias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editor-diferencias.component.html',
  styleUrl: './editor-diferencias.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDiferenciasComponent {
  private readonly alerts = inject(AlertService);
  contexto = input.required<{ seccion: string; campo: string; etiqueta: string; datoDeclarado: string }>();
  
  isProcessing = input<boolean>(false);
  
  // Output
  guardar = output<DiferenciaPayload>();
  cancelar = output<void>();

  datoObservado = signal<string>('');
  descripcion = signal<string>('');
  submitted = signal<boolean>(false);

  onGuardar() {
    this.submitted.set(true);
    if (!this.datoObservado().trim() && !this.descripcion().trim()) {
      this.alerts.showAlert('Indica el dato observado o describe claramente la diferencia.', 'warning');
      return;
    }
    const contexto = this.contexto();
    this.guardar.emit({
      seccion: contexto.seccion,
      campo: contexto.campo,
      datoDeclarado: contexto.datoDeclarado,
      datoObservado: this.datoObservado().trim(),
      descripcion: this.descripcion().trim()
    });
  }
}
