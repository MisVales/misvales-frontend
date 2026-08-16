import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
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
  private api = inject(SolicitudesDistribuidoraApiService);
  private router = inject(Router);
  private alerts = inject(AlertService);
  private confirmation = inject(ConfirmationService);

  enviando = false;
  actualizandoSeccion: string | null = null;

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
      { id: 'residence', label: 'Domicilios', status: s.domicilios, required: true },
      { id: 'partner', label: 'Pareja', status: s.pareja, required: false },
      { id: 'children', label: 'Hijos', status: s.hijos, required: false },
      { id: 'family_references', label: 'Referencias Familiares', status: s.referenciasFamiliares, required: false },
      { id: 'vehicles', label: 'Vehículos', status: s.vehiculos, required: false },
      { id: 'assets', label: 'Bienes', status: s.bienes, required: false },
      { id: 'liabilities', label: 'Pasivos', status: s.pasivos, required: false },
      { id: 'employment', label: 'Empleos', status: s.empleos, required: false },
      { id: 'commercial_credits', label: 'Créditos Comerciales', status: s.creditosComerciales, required: false }
    ];
  }

  async actualizarEstado(id: string, estado: string) {
    if (this.store.detalle()?.estado !== 'DRAFT' || !estado || this.actualizandoSeccion) return;

    this.actualizandoSeccion = id;
    try {
      await this.store.actualizarDeclaraciones({ [id]: estado });
      this.alerts.showAlert('Estado de la sección actualizado.', 'success');
    } catch (e: any) {
      this.alerts.showAlert(apiErrorMessage(e, 'No fue posible actualizar el estado de la sección.'), 'error');
    } finally {
      this.actualizandoSeccion = null;
    }
  }

  async enviarARevision() {
    if (!this.canSubmit) return;

    const confirmacion = await this.confirmation.confirm({ title: 'Enviar solicitud a revisión', message: 'La solicitud quedará bloqueada para edición y pasará al coordinador. Revisa el resumen antes de continuar.', confirmLabel: 'Sí, enviar a revisión' });
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    this.enviando = true;
    try {
      await firstValueFrom(this.api.enviarARevision(idSolicitud, version));
      await this.store.cargarDetalle(idSolicitud);
      this.alerts.showAlert('Solicitud enviada a revisión correctamente.', 'success');
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
