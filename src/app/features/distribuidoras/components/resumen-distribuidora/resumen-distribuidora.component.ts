import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Distribuidora } from '../../models/distribuidora.model';

@Component({
  selector: 'app-resumen-distribuidora',
  standalone: true,
  imports: [CommonModule],
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
