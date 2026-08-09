import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { firstValueFrom } from 'rxjs';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { Branch, PersonnelAssignment } from '../../../organization/data-access/organization.dtos';

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

  branches: Branch[] = [];
  coordinators: PersonnelAssignment[] = [];
  isLoadingCatalogs = false;
  selectedBranchId: string | null = null;

  crearForm = this.fb.group({
    branch_id: ['', Validators.required],
    coordinator_id: ['', Validators.required]
  });

  async ngOnInit() {
    this.isLoadingCatalogs = true;
    try {
      const branches = await firstValueFrom(this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' }));
      this.branches = branches.data;
      if (this.branches.length === 1) {
        this.crearForm.patchValue({ branch_id: this.branches[0].id });
        await this.onBranchChange(this.branches[0].id);
      }
    } finally {
      this.isLoadingCatalogs = false;
    }
  }

  async onBranchChange(branchId: string) {
    this.selectedBranchId = branchId || null;
    this.crearForm.patchValue({ coordinator_id: '' });
    this.coordinators = [];

    if (!branchId) return;

    const assignments = await firstValueFrom(this.organizationApi.getBranchAssignments(branchId));
    this.coordinators = assignments.data.filter(
      (assignment) => assignment.assignment_status === 'ACTIVE' && assignment.role.code === 'coordinator',
    );
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
