import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { FiltrosDistribuidorasComponent } from '../../components/filtros-distribuidoras/filtros-distribuidoras.component';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { Distribuidora } from '../../models/distribuidora.model';
import { ReenviarInvitacionDialogComponent } from '../../dialogs/reenviar-invitacion-dialog/reenviar-invitacion-dialog.component';
import { ResendDistributorInvitationRequestDto } from '../../data-access/dtos/resend-distributor-invitation-request.dto';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-listado-distribuidoras-page',
  standalone: true,
  imports: [CommonModule, FiltrosDistribuidorasComponent, RouterLink, StatusLabelPipe, ReenviarInvitacionDialogComponent],
  templateUrl: './listado-distribuidoras-page.component.html',
  styleUrls: ['./listado-distribuidoras-page.component.css']
})
export class ListadoDistribuidorasPageComponent implements OnInit {
  store = inject(DistribuidorasStore);
  router = inject(Router);
  private session = inject(SessionStore);
  private api = inject(DistribuidorasApiService);
  private alerts = inject(AlertService);
  readonly distribuidoraParaReenvio = signal<Distribuidora | null>(null);
  readonly reenviando = signal(false);
  userRole = computed<'GERENTE' | 'COORDINADOR' | 'DISTRIBUIDORA'>(() => {
    const roles = this.session.roles();
    if (roles.includes('distributor')) return 'DISTRIBUIDORA';
    if (roles.includes('coordinator')) return 'COORDINADOR';
    return 'GERENTE';
  });
  
  ngOnInit() {
    this.store.listar(1, 10, {});
  }

  onFiltrosCambiados(filtros: any) {
    this.store.listar(1, 10, filtros);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.store.paginacion().ultimaPagina) {
      this.store.listar(pagina, this.store.paginacion().porPagina, this.store.filtros());
    }
  }

  irADetalle(id: string) {
    this.router.navigate(['/distribuidoras', id]);
  }

  abrirReenvio(distribuidora: Distribuidora): void {
    this.distribuidoraParaReenvio.set(distribuidora);
  }

  async reenviarInvitacion(payload: ResendDistributorInvitationRequestDto): Promise<void> {
    const distribuidora = this.distribuidoraParaReenvio();
    if (!distribuidora || this.reenviando()) return;
    this.reenviando.set(true);
    try {
      await firstValueFrom(this.api.reenviarInvitacion(distribuidora.id, payload));
      this.distribuidoraParaReenvio.set(null);
      this.alerts.showAlert('Correo de activación reenviado correctamente.', 'success');
    } catch (error: any) {
      this.alerts.showAlert(error?.error?.error?.message || 'No fue posible reenviar el correo de activación.', 'error');
    } finally {
      this.reenviando.set(false);
    }
  }
}
