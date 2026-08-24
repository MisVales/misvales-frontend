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
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-autorizacion-gerencial',
  standalone: true,
  imports: [
    FormsModule,
    StrictNumberInputDirective,
    DatePipe,
    RouterLink,
    EstadoSolicitudComponent,
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
