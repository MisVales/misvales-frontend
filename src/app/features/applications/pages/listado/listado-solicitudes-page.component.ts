import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '../../../../core/session/session.store';
import { DistribuidorasStore } from '../../../distributors/state/distribuidoras.store';
import { EstadoSolicitudComponent } from '../../../verifications/components/estado-solicitud/estado-solicitud.component';
import { SolicitudesListadoStore } from '../../state/solicitudes-listado.store';

@Component({
  selector: 'app-listado-solicitudes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, EstadoSolicitudComponent],
  templateUrl: './listado-solicitudes-page.component.html',
  styleUrls: ['./listado-solicitudes-page.component.css'],
})
export class ListadoSolicitudesPageComponent implements OnInit {
  protected readonly applicationsStore = inject(SolicitudesListadoStore);
  protected readonly distributorsStore = inject(DistribuidorasStore);
  private readonly sessionStore = inject(SessionStore);

  ngOnInit(): void {
    void this.distributorsStore.listar(1, 10);
    void this.applicationsStore.listar(1, 5);
  }

  canCreateApplication(): boolean {
    return this.hasPermission('distributor_applications.create');
  }

  distributorStatusLabel(status: string): string {
    return ({ ACTIVE: 'Activa', PENDING_ACTIVATION: 'Pendiente de activación', DISABLED: 'Desactivada', BLOCKED: 'Bloqueada' } as Record<string, string>)[status] ?? 'Estado no disponible';
  }

  accessStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Acceso permitido' : 'Acceso restringido';
  }

  applicantName(application: { solicitante: { nombreCompleto?: string; nombre: string; apellidoPaterno: string; apellidoMaterno: string } | null }): string {
    const applicant = application.solicitante;
    if (!applicant) return 'Datos por capturar';
    return applicant.nombreCompleto || [applicant.nombre, applicant.apellidoPaterno, applicant.apellidoMaterno].filter(Boolean).join(' ');
  }

  changeDistributorPage(delta: number): void {
    const pagination = this.distributorsStore.paginacion();
    void this.distributorsStore.listar(pagination.paginaActiva + delta, pagination.porPagina, this.distributorsStore.filtros());
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.sessionStore.permissions();
    return permissions.includes('all') || permissions.includes(permission);
  }
}
