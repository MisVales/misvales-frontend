import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  // Configuración de campos disponibles para registrar diferencia
  seccionesDisponibles = input<{ id: string; label: string }[]>([]);
  camposDisponibles = input<Record<string, { id: string; label: string; valorOriginal: string }[]>>({});
  
  isProcessing = input<boolean>(false);
  
  // Output
  guardar = output<DiferenciaPayload>();
  cancelar = output<void>();

  // State
  seccion = signal<string>('');
  campo = signal<string>('');
  datoObservado = signal<string>('');
  descripcion = signal<string>('');
  
  // Derived state (no computed to keep simple binds in template)
  datoDeclarado = signal<string>('');

  onSeccionChange(val: string) {
    this.seccion.set(val);
    this.campo.set('');
    this.datoDeclarado.set('');
  }

  onCampoChange(val: string) {
    this.campo.set(val);
    const campos = this.camposDisponibles()[this.seccion()] || [];
    const found = campos.find(c => c.id === val);
    if (found) {
      this.datoDeclarado.set(found.valorOriginal);
    } else {
      this.datoDeclarado.set('');
    }
  }

  onGuardar() {
    if (!this.seccion() || !this.campo() || (!this.datoObservado() && !this.descripcion())) {
      alert('Debes completar todos los campos obligatorios para registrar una diferencia.');
      return;
    }
    
    this.guardar.emit({
      seccion: this.seccion(),
      campo: this.campo(),
      datoDeclarado: this.datoDeclarado(),
      datoObservado: this.datoObservado(),
      descripcion: this.descripcion()
    });
  }
}
