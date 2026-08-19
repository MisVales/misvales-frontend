import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistribuidorasApiService } from '../distribuidoras/data-access/api/distribuidoras-api.service';
import { Distribuidora } from '../distribuidoras/models/distribuidora.model';
import { OrganizationApiService } from '../organization/data-access/organization-api.service';
import { PersonnelAssignment } from '../organization/data-access/organization.dtos';
import { TransferenciasApiService } from './transferencias-api.service';

@Component({
  selector: 'app-transferencias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transferencias-page.component.html',
})
export class TransferenciasPageComponent implements OnInit {
  private readonly distributorsApi = inject(DistribuidorasApiService);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly transfersApi = inject(TransferenciasApiService);

  protected readonly distributors = signal<Distribuidora[]>([]);
  protected readonly coordinators = signal<PersonnelAssignment[]>([]);
  protected readonly history = signal<OrganizationalChange[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly selectedDistributorId = signal('');
  protected readonly destinationCoordinatorId = signal('');
  protected reason = '';

  protected readonly selectedDistributor = computed(
    () => this.distributors().find((item) => item.id === this.selectedDistributorId()) ?? null,
  );
  protected readonly eligibleCoordinators = computed(() => {
    const branchId = this.selectedDistributor()?.sucursal.id;
    return this.coordinators().filter((item) => item.branch_id === branchId);
  });

  async ngOnInit(): Promise<void> {
    try {
      const [distributors, personnel, history] = await Promise.all([
        firstValueFrom(this.distributorsApi.listar(1, 100, { status: 'ACTIVE' })),
        firstValueFrom(this.organizationApi.getPersonnel({ per_page: 100, assignment_status: 'ACTIVE' })),
        firstValueFrom(this.transfersApi.history()),
      ]);
      this.distributors.set(distributors.datos);
      this.coordinators.set(personnel.data.filter((item) => item.role.code === 'coordinator'));
      this.history.set(history);
    } catch {
      this.error.set('No fue posible cargar las distribuidoras o coordinadores autorizados.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onDistributorChange(id: string): void {
    this.selectedDistributorId.set(id);
    this.destinationCoordinatorId.set('');
    this.success.set('');
  }

  protected async reassignCoordinator(): Promise<void> {
    const distributor = this.selectedDistributor();
    const destination = this.destinationCoordinatorId();
    if (!distributor || !destination || !this.reason.trim() || this.saving()) return;

    this.saving.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.transfersApi.changeCoordinator(distributor.id, destination, this.reason.trim()));
      this.success.set('La distribuidora quedó reasignada al coordinador elegido.');
      this.reason = '';
      await this.ngOnInit();
    } catch {
      this.error.set('No fue posible reasignar la distribuidora. Revisa el motivo, el estado y el alcance del coordinador.');
    } finally {
      this.saving.set(false);
    }
  }
}

interface OrganizationalChange {
  id: string;
  type: string;
  reason: string;
  occurred_at: string;
}
