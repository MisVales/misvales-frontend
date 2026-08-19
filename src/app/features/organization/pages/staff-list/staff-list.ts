import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationApiService } from '../../data-access/organization-api.service';
import { PersonnelAssignment } from '../../data-access/organization.dtos';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusLabelPipe],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffList implements OnInit {
  private api = inject(OrganizationApiService);

  staff = signal<PersonnelAssignment[]>([]);
  isLoading = signal(false);
  total = signal(0);
  
  filterSearch = signal('');
  filterStatus = signal('');
  filterRole = signal('');
  filterBranch = signal('');

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    const branchId = this.filterBranch();
    this.isLoading.set(true);
    const request = branchId
      ? this.api.getBranchPersonnel(branchId)
      : this.api.getPersonnel({ per_page: 100 });
    request.subscribe({
      next: (res) => {
        const search = this.filterSearch().trim().toLowerCase();
        const staff = search
          ? res.data.filter((assignment) => assignment.user.name.toLowerCase().includes(search)
              || assignment.user.email.toLowerCase().includes(search))
          : res.data;
        this.staff.set(staff);
        this.total.set(res.meta.total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterChange() {
    this.loadStaff();
  }
}
