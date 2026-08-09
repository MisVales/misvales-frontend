import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Distribuidora } from '../../models/distribuidora.model';

@Component({
  selector: 'app-estado-acceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-acceso.component.html',
  styleUrls: ['./estado-acceso.component.css']
})
export class EstadoAccesoComponent {
  @Input({ required: true }) distribuidora!: Distribuidora;

  // En una implementación real, este componente abriría el dialog para reenviar invitación
  reenviarInvitacion() {
    alert('Abre el modal de reenvío de invitación (Fase 4)');
  }
}
