import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

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
      { id: 'personal_data', label: 'Datos Personales', status: s.personalData },
      { id: 'residence', label: 'Domicilios', status: s.residence },
      { id: 'partner', label: 'Pareja', status: s.partner },
      { id: 'children', label: 'Hijos', status: s.children },
      { id: 'family_references', label: 'Referencias Familiares', status: s.familyReferences },
      { id: 'vehicles', label: 'Vehículos', status: s.vehicles },
      { id: 'assets', label: 'Bienes', status: s.assets },
      { id: 'liabilities', label: 'Pasivos', status: s.liabilities },
      { id: 'employment', label: 'Empleos', status: s.employment },
      { id: 'commercial_credits', label: 'Créditos Comerciales', status: s.commercialCredits }
    ];
  }

  async enviarARevision() {
    if (!this.canSubmit) return;

    const confirmacion = confirm('¿Estás seguro de enviar la solicitud a revisión del coordinador? Una vez enviada, ya no podrás editarla.');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    this.enviando = true;
    try {
      await firstValueFrom(this.api.enviarARevision(idSolicitud, version));
      await this.store.cargarDetalle(idSolicitud);
      alert('¡Solicitud enviada a revisión exitosamente!');
    } catch (e: any) {
      if (e?.status === 409) {
        alert('El expediente fue modificado por otro usuario. Recarga la información antes de continuar.');
      } else {
        alert(e?.error?.message || 'Hubo un error al enviar a revisión.');
      }
    } finally {
      this.enviando = false;
    }
  }
}
