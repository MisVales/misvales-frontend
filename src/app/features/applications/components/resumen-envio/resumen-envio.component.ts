import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { apiErrorMessage } from '../../../../core/api/api-error';

@Component({
  selector: 'app-resumen-envio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-envio.component.html',
  styleUrls: ['./resumen-envio.component.css']
})
export class ResumenEnvioComponent {
  protected store = inject(SolicitudDetalleStore);
  private router = inject(Router);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  enviando = false;

  get canSubmit(): boolean {
    return this.store.detalle()?.estado === 'DRAFT' &&
      !!this.store.detalle()?.avance.puedeEnviarse;
  }

  get secciones(): any {
    return this.store.detalle()?.declaracionesSeccion || {};
  }

  getSeccionesArray() {
    const s = this.secciones;
    return [
      { id: 'personal_data', label: 'Datos Personales', status: s.datosPersonales, required: true },
      { id: 'family', label: 'Familiares', status: this.combineStatuses(s.pareja, s.hijos, s.referenciasFamiliares), required: false },
      { id: 'residence', label: 'Domicilios', status: s.domicilios, required: true },
      { id: 'vehicles', label: 'Vehículos', status: s.vehiculos, required: false },
      { id: 'assets_liabilities', label: 'Patrimonio', status: this.combineStatuses(s.bienes, s.pasivos), required: false },
      { id: 'employment', label: 'Empleos', status: s.empleos, required: false },
      { id: 'commercial_credits', label: 'Créditos Comerciales', status: s.creditosComerciales, required: false }
    ];
  }

  private combineStatuses(...statuses: Array<string | undefined>): string {
    if (statuses.includes('PENDING')) return 'PENDING';
    if (statuses.includes('COMPLETED')) return 'COMPLETED';
    return 'NOT_APPLICABLE';
  }

  get faltantes() {
    return this.getSeccionesArray().filter(s => !s.status || s.status === 'PENDING');
  }

  async enviarARevision() {
    if (!this.canSubmit) return;

    const confirmacion = await this.confirmation.confirm({ title: 'Enviar solicitud a revisión', message: 'La solicitud quedará bloqueada para edición y pasará al coordinador. Revisa el resumen antes de continuar.', confirmLabel: 'Sí, enviar a revisión' });
    if (!confirmacion) return;

    this.enviando = true;
    try {
      await this.store.enviarARevision();
      this.alerts.showAlert('Solicitud enviada a revisión correctamente.', 'success');
      await this.router.navigate(['/solicitudes-distribuidoras']);
    } catch (e: any) {
      if (e?.status === 409) {
        this.alerts.showAlert('El expediente fue modificado por otra persona. Se requiere recargar antes de continuar.', 'warning');
      } else {
        this.alerts.showAlert(apiErrorMessage(e, 'No fue posible enviar la solicitud a revisión.'), 'error');
      }
    } finally {
      this.enviando = false;
    }
  }
}
