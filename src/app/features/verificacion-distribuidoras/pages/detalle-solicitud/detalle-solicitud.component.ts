import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LineaTiempoSolicitudComponent } from '../../components/linea-tiempo-solicitud/linea-tiempo-solicitud.component';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [DatePipe, RouterLink, EstadoSolicitudComponent, LineaTiempoSolicitudComponent, FormsModule],
  templateUrl: './detalle-solicitud.component.html',
  styleUrl: './detalle-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleSolicitudComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly sessionStore = inject(SessionStore);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  // Permisos helpers
  get canAssign(): boolean {
    return this.sessionStore.permissions().includes('verify_applications');
  }

  get canEvaluate(): boolean {
    return this.sessionStore.permissions().includes('evaluate_applications');
  }

  get canAuthorize(): boolean {
    return this.sessionStore.permissions().includes('authorize_applications');
  }

  isDevolucionModalOpen = signal(false);
  devolucionMotivo = signal('');
  devolucionSecciones = signal<string[]>([]);
  
  seccionesDisponibles = [
    { value: 'DATOS_PERSONALES', label: 'Datos Personales' },
    { value: 'DOMICILIO', label: 'Domicilio' },
    { value: 'REFERENCIAS', label: 'Referencias Familiares/Personales' },
    { value: 'INFORMACION_LABORAL', label: 'Información Laboral' },
    { value: 'BIENES', label: 'Bienes y Compromisos' }
  ];

  toggleSeccionDevolucion(valor: string) {
    const actuales = this.devolucionSecciones();
    if (actuales.includes(valor)) {
      this.devolucionSecciones.set(actuales.filter(s => s !== valor));
    } else {
      this.devolucionSecciones.set([...actuales, valor]);
    }
  }

  abrirDevolucionModal() {
    this.devolucionMotivo.set('');
    this.devolucionSecciones.set([]);
    this.isDevolucionModalOpen.set(true);
  }

  cerrarDevolucionModal() {
    this.isDevolucionModalOpen.set(false);
  }

  async confirmarDevolucion(lockVersion: number) {
    if (!this.devolucionMotivo() || this.devolucionSecciones().length === 0) {
      alert('Debes proporcionar un motivo y seleccionar al menos una sección pendiente.');
      return;
    }

    if (!confirm('¿Estás seguro de devolver esta solicitud a captura?')) return;

    const req = {
      motivo: this.devolucionMotivo(),
      seccionesPendientes: this.devolucionSecciones(),
      lock_version: lockVersion
    };

    const id = this.facade.solicitudSeleccionada()?.id;
    if (id) {
      const success = await this.facade.devolverACaptura(id, req);
      if (success) {
        this.cerrarDevolucionModal();
        alert('Solicitud devuelta a captura exitosamente.');
      }
    }
  }
}
