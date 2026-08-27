import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { firstValueFrom } from 'rxjs';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { Branch, PersonnelAssignment } from '../../../organization/data-access/organization.dtos';
import { SessionStore } from '../../../../core/session/session.store';
import { ApplicationFormErrorStateDirective } from '../../directives/application-form-error-state.directive';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-crear-solicitud-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ApplicationFormErrorStateDirective,
    RefactorSelectComponent,
  ],
  templateUrl: './crear-solicitud-page.component.html',
  styleUrls: ['./crear-solicitud-page.component.css'],
})
export class CrearSolicitudPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject(SolicitudDetalleStore);
  private organizationApi = inject(OrganizationApiService);
  protected session = inject(SessionStore);
  private readonly alerts = inject(AlertService);

  branches = signal<Branch[]>([]);
  coordinators = signal<PersonnelAssignment[]>([]);
  isLoadingCatalogs = signal(false);
  catalogError = signal<string | null>(null);
  selectedBranchId = signal<string | null>(null);

  isGeneralManager = computed(() => this.session.roles().includes('general_manager'));
  isBranchManager = computed(() => this.session.roles().includes('branch_manager'));
  isCoordinator = computed(() => this.session.roles().includes('coordinator'));

  isFixedBranch = computed(
    () => !this.isGeneralManager() && (this.isBranchManager() || this.isCoordinator()),
  );
  isFixedCoordinator = computed(() => this.isCoordinator());

  activeBranchName = computed(() => {
    const branchId = this.session.activeBranch();
    const branch = this.branches().find((b) => b.id === branchId);
    const sessionBranch = this.session.scopes().find((scope) => scope.branchId === branchId);
    return branch?.name ?? sessionBranch?.branchName ?? 'Sucursal asignada a su sesión';
  });

  crearForm = this.fb.group({
    branch_id: ['', Validators.required],
    coordinator_id: ['', Validators.required],
  });

  async ngOnInit() {
    this.isLoadingCatalogs.set(true);
    this.catalogError.set(null);

    try {
      const branchId = this.session.activeBranch();
      const userId = this.session.user()?.id;

      if (this.isFixedBranch()) {
        if (!branchId) {
          this.blockForIncompleteContext(
            'No hay una sucursal activa en la sesión. Solicita que revisen tu asignación.',
          );
          return;
        }

        this.selectedBranchId.set(branchId);
        this.crearForm.patchValue({ branch_id: branchId });

        if (this.isFixedCoordinator()) {
          if (!userId) {
            this.blockForIncompleteContext(
              'No se pudo identificar al coordinador de la sesión. Vuelve a iniciar sesión.',
            );
            return;
          }

          this.crearForm.patchValue({ coordinator_id: userId });
          return;
        }

        const branch = await firstValueFrom(this.organizationApi.getBranch(branchId));
        this.branches.set([branch]);

        await this.onBranchChange(branchId);
        return;
      }

      if (!this.isGeneralManager()) {
        this.blockForIncompleteContext(
          'La sesión no tiene un alcance autorizado para crear solicitudes.',
        );
        return;
      }

      const branches = await firstValueFrom(
        this.organizationApi.getBranches({ per_page: 100, status: 'ACTIVE' }),
      );
      this.branches.set(branches.data);

      if (branches.data.length === 1) {
        this.crearForm.patchValue({ branch_id: branches.data[0].id });
        await this.onBranchChange(branches.data[0].id);
      }
    } catch {
      this.catalogError.set('No fue posible cargar las opciones autorizadas. Intenta nuevamente.');
    } finally {
      this.isLoadingCatalogs.set(false);
    }
  }

  async onBranchChange(branchId: string) {
    this.catalogError.set(null);
    this.selectedBranchId.set(branchId || null);
    this.crearForm.patchValue({ coordinator_id: '' });
    this.coordinators.set([]);

    if (!branchId) return;

    try {
      const assignments = await firstValueFrom(this.organizationApi.getBranchAssignments(branchId));
      this.coordinators.set(
        assignments.data.filter(
          (assignment) =>
            assignment.assignment_status === 'ACTIVE' && assignment.role.code === 'coordinator',
        ),
      );
    } catch {
      this.catalogError.set(
        'No fue posible cargar los coordinadores autorizados para la sucursal.',
      );
    }
  }

  async onSubmit() {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }

    try {
      const id = await this.store.crearSolicitud({
        branch_id: this.crearForm.value.branch_id!,
        coordinator_id: this.crearForm.value.coordinator_id!,
      });
      this.alerts.success('El expediente se creó correctamente.');
      await this.router.navigate(['/solicitudes-distribuidoras', id]);
    } catch (e) {
      // Error handled by store
    }
  }

  cancelar() {
    this.router.navigate(['/solicitudes-distribuidoras']);
  }

  marcarCampoAlEnfocar(control: keyof typeof this.crearForm.controls): void {
    this.crearForm.controls[control].markAsTouched();
  }

  private blockForIncompleteContext(message: string): void {
    this.branches.set([]);
    this.coordinators.set([]);
    this.selectedBranchId.set(null);
    this.crearForm.patchValue({ branch_id: '', coordinator_id: '' });
    this.catalogError.set(message);
  }
}
