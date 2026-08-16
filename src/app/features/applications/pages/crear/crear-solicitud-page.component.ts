import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { firstValueFrom } from 'rxjs';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { Branch, PersonnelAssignment } from '../../../organization/data-access/organization.dtos';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-crear-solicitud-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-solicitud-page.component.html',
  styleUrls: ['./crear-solicitud-page.component.css']
})
export class CrearSolicitudPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(SolicitudDetalleStore);
  private organizationApi = inject(OrganizationApiService);
  protected session = inject(SessionStore);

  branches = signal<Branch[]>([]);
  coordinators = signal<PersonnelAssignment[]>([]);
  isLoadingCatalogs = signal(false);
  selectedBranchId = signal<string | null>(null);

  isGeneralManager = computed(() => this.session.roles().includes('general_manager'));
  isBranchManager = computed(() => this.session.roles().includes('branch_manager'));
  isCoordinator = computed(() => this.session.roles().includes('coordinator'));

  isFixedBranch = computed(() => !this.isGeneralManager() && (this.isBranchManager() || this.isCoordinator()));
  isFixedCoordinator = computed(() => this.isCoordinator());

  activeBranchName = computed(() => {
    const branchId = this.session.activeBranch();
    const branch = this.branches().find(b => b.id === branchId);
    return branch ? branch.name : 'Sucursal asignada a su sesión';
  });

  crearForm = this.fb.group({
    branch_id: ['', Validators.required],
    coordinator_id: ['', Validators.required]
  });

  async ngOnInit() {
    this.isLoadingCatalogs.set(true);
    try {
      const branches = await firstValueFrom(this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' }));
      this.branches.set(branches.data);

      const branchId = this.session.activeBranch();
      const userId = this.session.user()?.id;

      if (this.isFixedBranch() && branchId) {
        this.selectedBranchId.set(branchId);
        this.crearForm.patchValue({ branch_id: branchId });

        if (this.isFixedCoordinator() && userId) {
          this.crearForm.patchValue({ coordinator_id: userId });
        } else {
          await this.onBranchChange(branchId);
        }
      } else {
        if (branches.data.length === 1) {
          this.crearForm.patchValue({ branch_id: branches.data[0].id });
          await this.onBranchChange(branches.data[0].id);
        }
      }
    } finally {
      this.isLoadingCatalogs.set(false);
    }
  }

  async onBranchChange(branchId: string) {
    this.selectedBranchId.set(branchId || null);
    this.crearForm.patchValue({ coordinator_id: '' });
    this.coordinators.set([]);

    if (!branchId) return;

    const assignments = await firstValueFrom(this.organizationApi.getBranchAssignments(branchId));
    this.coordinators.set(assignments.data.filter(
      (assignment) => assignment.assignment_status === 'ACTIVE' && assignment.role.code === 'coordinator',
    ));
  }

  async onSubmit() {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    try {
      const id = await this.store.crearSolicitud({
        branch_id: this.crearForm.value.branch_id!,
        coordinator_id: this.crearForm.value.coordinator_id!
      });
      // Redirect to detail
      this.router.navigate(['/solicitudes-distribuidoras', id]);
    } catch (e) {
      // Error handled by store
    }
  }

  cancelar() {
    this.router.navigate(['/solicitudes-distribuidoras']);
  }
}
