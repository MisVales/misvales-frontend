import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Distribuidora } from '../../models/distribuidora.model';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-resumen-distribuidora',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  templateUrl: './resumen-distribuidora.component.html',
  styleUrls: ['./resumen-distribuidora.component.css']
})
export class ResumenDistribuidoraComponent {
  @Input({ required: true }) distribuidora!: Distribuidora;
  @Output() abrirCambioCategoria = new EventEmitter<void>();
  @Output() abrirReenvio = new EventEmitter<void>();

  cambiarCategoria() {
    this.abrirCambioCategoria.emit();
  }

  reenviarInvitacion() {
    this.abrirReenvio.emit();
  }
}
