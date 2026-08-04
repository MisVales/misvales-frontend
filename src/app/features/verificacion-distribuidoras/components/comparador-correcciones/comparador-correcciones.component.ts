import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CorreccionSolicitud } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-comparador-correcciones',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './comparador-correcciones.component.html',
  styleUrl: './comparador-correcciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparadorCorreccionesComponent {
  correcciones = input<CorreccionSolicitud[]>([]);
}
