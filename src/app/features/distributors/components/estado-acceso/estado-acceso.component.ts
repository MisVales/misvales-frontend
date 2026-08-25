import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Distribuidora } from '../../models/distribuidora.model';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-estado-acceso',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  templateUrl: './estado-acceso.component.html',
  styleUrls: ['./estado-acceso.component.css']
})
export class EstadoAccesoComponent {
  @Input({ required: true }) distribuidora!: Distribuidora;
}
