import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationApiService } from '../../data-access/organization-api.service';
// import { StaffRes, AssignStaffReq } from '../../data-access/organization.dtos';
import { SessionStore } from '@core/session/session.store';
import { MeService } from '@core/services/me.service';

@Component({
  selector: 'app-staff-assignment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './staff-assignment.html',
  styleUrls: ['./staff-assignment.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffAssignment implements OnInit {
  private api = inject(OrganizationApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected sessionStore = inject(SessionStore);
  private meService = inject(MeService);

  staff = signal<any | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  showConfirmModal = signal(false);

  // Form State
  role = signal('');
  branchId = signal('');
  scopeType = signal<'global' | 'branch'>('branch');
  startDate = signal('');
  reason = signal('');

  // Rules
  isManager = computed(() => this.sessionStore.roles().includes('gerente'));
  managerBranch = computed(() => this.sessionStore.activeBranch());

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // this.api.getStaffById(id).subscribe({
      //   next: (res: any) => {
      //     this.staff.set(res);
      //     // Set initial form values based on current assignment or defaults
      //     this.role.set(res.effectiveRole || 'cajero');
      //     this.scopeType.set(res.branch ? 'branch' : 'global');
      //     this.branchId.set(res.branch ? res.branch.id : '');
          
      //     if (this.isManager() && this.managerBranch()) {
      //       this.branchId.set(this.managerBranch()!);
      //       this.scopeType.set('branch');
      //     }
      //     this.isLoading.set(false);
      //   },
      //   error: () => this.isLoading.set(false)
      // });
      this.isLoading.set(false);
    }
  }

  onScopeTypeChange(val: string) {
    if (val === 'global') {
      this.branchId.set('');
    }
  }

  isFormValid() {
    return this.role() && (this.scopeType() === 'global' || this.branchId()) && this.startDate() && this.reason();
  }

  openConfirmModal() {
    if (this.isFormValid()) {
      this.showConfirmModal.set(true);
    }
  }

  submitAssignment() {
    if (!this.staff()) return;
    this.isSubmitting.set(true);
    
    const req: any = {
      userId: this.staff()!.userId,
      role: this.role(),
      branchId: this.scopeType() === 'global' ? null : this.branchId(),
      scopeType: this.scopeType(),
      startDate: this.startDate(),
      reason: this.reason()
    };

    // this.api.assignStaff(this.staff()!.id, req).subscribe({
    //   next: () => {
    //     // Renovación de contexto: Si me edito a mí mismo, recargar /me
    //     if (this.staff()!.userId === this.sessionStore.user()?.id) {
    //       this.meService.fetchMe().subscribe(() => {
    //         this.router.navigate(['/organizacion/personal', this.staff()!.id]);
    //       });
    //     } else {
    //       this.router.navigate(['/organizacion/personal', this.staff()!.id]);
    //     }
    //   },
    //   error: () => {
    //     this.isSubmitting.set(false);
    //     this.showConfirmModal.set(false);
    //   }
    // });
    this.isSubmitting.set(false);
    this.showConfirmModal.set(false);
  }
}
