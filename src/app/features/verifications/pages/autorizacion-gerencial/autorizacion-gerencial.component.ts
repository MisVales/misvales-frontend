import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { StrictNumberInputDirective } from '../../../../shared/directives/strict-number-input.directive';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LineaTiempoSolicitudComponent } from '../../components/linea-tiempo-solicitud/linea-tiempo-solicitud.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '../../../../core/session/session.store';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { firstValueFrom } from 'rxjs';
import { presentarRegistrosDeclarados } from '../detalle-solicitud/datos-declarados.presenter';

@Component({
  selector: 'app-autorizacion-gerencial',
  standalone: true,
  imports: [
    FormsModule,
    StrictNumberInputDirective,
    DatePipe,
    KeyValuePipe,
    RouterLink,
    EstadoSolicitudComponent,
    LineaTiempoSolicitudComponent,
    GaleriaEvidenciasComponent,
    StatusLabelPipe,
    LucideAngularModule,
  ],
  templateUrl: './autorizacion-gerencial.component.html',
  styleUrl: './autorizacion-gerencial.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutorizacionGerencialComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly sessionStore = inject(SessionStore);
  private readonly mediaApi = inject(MediaApiService);

  readonly tiposEvidenciaDeclarada = [
    { id: 'IDENTIFICATION', label: 'Identificación oficial' },
    { id: 'ADDRESS_PROOF', label: 'Comprobante de domicilio' },
    { id: 'VEHICLE_EVIDENCE', label: 'Evidencia de vehículo' },
    { id: 'ASSET_EVIDENCE', label: 'Evidencia patrimonial' },
    { id: 'COMMERCIAL_EVIDENCE', label: 'Evidencia de crédito comercial' },
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

  decision = signal<'APPROVED' | 'REJECTED' | null>(null);
  comentarios = signal<string>('');
  submitted = signal(false);
  lineaInicial = signal<string>('');
  readonly isInbox = signal(false);
  readonly search = signal('');
  readonly filteredApplications = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('es-MX');
    if (!term) return this.facade.solicitudes();

    return this.facade.solicitudes().filter((application) =>
      [application.folio, application.aspirante.nombreCompleto, application.sucursal.nombre]
        .some((value) => value.toLocaleLowerCase('es-MX').includes(term)),
    );
  });
  readonly scopeLabel = computed(() =>
    this.sessionStore.roles().includes('branch_manager') ? 'Mi sucursal' : 'Todas las sucursales',
  );

  // Simulated manager credentials for double auth in a real world scenario
  password = signal<string>('');

  etiquetaSeccion(seccion: string): string {
    return this.etiquetasSeccion[seccion] ?? seccion.replaceAll('_', ' ');
  }

  registrosSeccion(valor: unknown) {
    return presentarRegistrosDeclarados(valor);
  }

  async descargarEvidencia(visitaId: string, evidenciaId: string) {
    const blob = await this.facade.descargarEvidenciaBlob(visitaId, evidenciaId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `evidencia-${evidenciaId}`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  async descargarEvidenciaDeclarada(evidenciaId: string) {
    try {
      const blob = await firstValueFrom(this.mediaApi.download(evidenciaId));
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `evidencia-declarada-${evidenciaId}`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      this.alerts.showAlert('No fue posible descargar la evidencia declarada.', 'error');
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
    } else {
      this.isInbox.set(true);
      void this.facade.cargarSolicitudes(1, 20, 'MANAGER_AUTHORIZATION');
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  onPageChange(page: number): void {
    void this.facade.cargarSolicitudes(page, this.facade.perPageSolicitudes(), 'MANAGER_AUTHORIZATION');
  }

  refreshInbox(): void {
    void this.facade.cargarSolicitudes(
      this.facade.pageSolicitudes(),
      this.facade.perPageSolicitudes(),
      'MANAGER_AUTHORIZATION',
    );
  }

  async onAuthorize() {
    this.submitted.set(true);
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (!this.decision()) {
      this.alerts.showAlert('Selecciona una decisión gerencial.', 'warning');
      return;
    }

    if (this.decision() === 'REJECTED' && !this.comentarios()) {
      this.alerts.showAlert('El motivo de rechazo es obligatorio.', 'warning');
      return;
    }

    if (
      this.decision() === 'APPROVED' &&
      (!this.lineaInicial() || Number(this.lineaInicial()) <= 0)
    ) {
      this.alerts.showAlert('Introduce una línea inicial mayor que cero.', 'warning');
      return;
    }

    // Example logic rule
    if (
      this.decision() === 'APPROVED' &&
      solicitud.ultimaEvaluacion?.dictamen === 'DOES_NOT_COMPLY'
    ) {
      if (
        !(await this.confirmation.confirm({
          title: 'Dictámenes no coincidentes',
          message:
            'La evaluación de coordinación es desfavorable. Confirma que deseas continuar con una aprobación excepcional.',
          confirmLabel: 'Continuar con aprobación',
          tone: 'danger',
        }))
      ) {
        return;
      }
    }

    if (
      !(await this.confirmation.confirm({
        title: 'Emitir dictamen final',
        message: `Registrarás la solicitud como ${this.decision() === 'APPROVED' ? 'aprobada' : 'rechazada'}. Esta decisión cierra el proceso de verificación.`,
        confirmLabel: 'Emitir dictamen',
        tone: this.decision() === 'REJECTED' ? 'danger' : 'default',
      }))
    ) {
      return;
    }

    const comentarios = this.comentarios().trim();
    const motivoFinal = comentarios || (this.decision() === 'APPROVED' ? 'Aprobación gerencial' : '');

    const req = {
      decision: this.decision()!,
      motivo: motivoFinal,
      linea_inicial: this.decision() === 'APPROVED' ? this.lineaInicial() : null,
      lock_version: solicitud.lockVersion,
    };

    const success = await this.facade.autorizarSolicitud(solicitud.id, req);
    if (success) {
      this.alerts.showAlert(
        'Decisión gerencial registrada. El proceso de verificación finalizó.',
        'success',
      );
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }
}
