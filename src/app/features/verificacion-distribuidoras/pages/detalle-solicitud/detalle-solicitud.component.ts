import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LineaTiempoSolicitudComponent } from '../../components/linea-tiempo-solicitud/linea-tiempo-solicitud.component';
import { SessionStore } from '../../../../core/session/session.store';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { presentarRegistrosDeclarados } from './datos-declarados.presenter';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [DatePipe, KeyValuePipe, RouterLink, EstadoSolicitudComponent, LineaTiempoSolicitudComponent, FormsModule],
  templateUrl: './detalle-solicitud.component.html',
  styleUrl: './detalle-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleSolicitudComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly sessionStore = inject(SessionStore);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);

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
    const roles = this.sessionStore.roles();
    return roles.includes('coordinator');
  }

  get canEvaluate(): boolean {
    const roles = this.sessionStore.roles();
    return roles.includes('coordinator');
  }

  get canAuthorize(): boolean {
    const roles = this.sessionStore.roles();
    return roles.includes('general_manager') || roles.includes('branch_manager');
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

  private readonly etiquetasSeccion: Record<string, string> = {
    personal_data: 'Datos personales',
    family_members: 'Familiares y referencias',
    residences: 'Domicilios',
    vehicles: 'Vehículos',
    assets_liabilities: 'Bienes y compromisos',
    employments: 'Empleos',
    commercial_credits: 'Créditos comerciales',
  };

  etiquetaSeccion(seccion: string): string {
    return this.etiquetasSeccion[seccion] ?? seccion.replaceAll('_', ' ');
  }

  registrosSeccion(valor: unknown) {
    return presentarRegistrosDeclarados(valor);
  }

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
      this.alerts.showAlert('Indica el motivo y selecciona al menos una sección pendiente.', 'warning');
      return;
    }

    if (!await this.confirmation.confirm({ title: 'Devolver a captura', message: 'La solicitud regresará a captura con las secciones seleccionadas como pendientes.', confirmLabel: 'Devolver solicitud', tone: 'danger' })) return;

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
        this.alerts.showAlert('Solicitud devuelta a captura.', 'success');
      }
    }
  }
}
