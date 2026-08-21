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

  isManager = computed(() => this.sessionStore.roles().includes('gerente'));
  managerBranch = computed(() => this.sessionStore.activeBranch());

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
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
    
    this.isSubmitting.set(false);
    this.showConfirmModal.set(false);
  }
}
