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

  etiquetaSeccion(value: string): string {
    return ({ personal_data: 'Datos personales', personal_info: 'Datos personales', family_members: 'Familiares y referencias', residences: 'Domicilios', vehicles: 'Vehículos', assets_liabilities: 'Bienes y compromisos', employments: 'Empleos', commercial_credits: 'Créditos comerciales' } as Record<string, string>)[value] || 'Solicitud';
  }

  etiquetaCampo(value: string): string {
    if (value === 'curp' || value === 'curp_masked') return 'CURP';
    return ({ has_identification_evidence: 'Identificación oficial', school_name: 'Escuela', proof_reference: 'Comprobante del crédito' } as Record<string, string>)[value] || value.replaceAll('_', ' ');
  }
}
