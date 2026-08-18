import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SolicitudesListadoStore } from '../../state/solicitudes-listado.store';
import { firstValueFrom } from 'rxjs';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { Branch, PersonnelAssignment } from '../../../organization/data-access/organization.dtos';
import { SessionStore } from '../../../../core/session/session.store';
import { EstadoSolicitudComponent } from '../../../verificacion-distribuidoras/components/estado-solicitud/estado-solicitud.component';

@Component({
  selector: 'app-listado-solicitudes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EstadoSolicitudComponent],
  templateUrl: './listado-solicitudes-page.component.html',
  styleUrls: ['./listado-solicitudes-page.component.css']
})
export class ListadoSolicitudesPageComponent implements OnInit {
  protected store = inject(SolicitudesListadoStore);
  private fb = inject(FormBuilder);
  private organizationApi = inject(OrganizationApiService);
  private sessionStore = inject(SessionStore);

  branches: Branch[] = [];
  coordinators: PersonnelAssignment[] = [];

  filtrosForm = this.fb.group({
    application_number: [''],
    status: [''],
    branch_id: [''],
    coordinator_id: [''],
    created_from: ['']
  });

  async ngOnInit() {
    this.store.listar();
    await this.cargarCatalogos();

    this.filtrosForm.valueChanges.subscribe(() => {
      this.store.listar(1, 10, this.getFiltrosVigentes());
    });
  }

  private async cargarCatalogos(): Promise<void> {
    const permissions = this.sessionStore.permissions();
    const puedeConsultarOrganizacion = permissions.includes('all')
      || permissions.includes('branches.view')
      || permissions.includes('roles.assign');

    if (!puedeConsultarOrganizacion) return;

    const [branches, personnel] = await Promise.allSettled([
      firstValueFrom(this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' })),
      firstValueFrom(this.organizationApi.getPersonnel({ per_page: 100, assignment_status: 'ACTIVE' })),
    ]);

    if (branches.status === 'fulfilled') this.branches = branches.value.data;
    if (personnel.status === 'fulfilled') {
      this.coordinators = personnel.value.data.filter((assignment) => assignment.role.code === 'coordinator');
    }
  }

  getFiltrosVigentes(): Record<string, string> {
    const val = this.filtrosForm.value;
    const filtrosActivos: Record<string, string> = {};
    Object.keys(val).forEach(key => {
      const value = (val as any)[key];
      if (value) filtrosActivos[key] = value;
    });
    return filtrosActivos;
  }

  getProgresoAncho(completadas: number, totales: number): string {
    if (!totales) return '0%';
    return `${(completadas / totales) * 100}%`;
  }
}
