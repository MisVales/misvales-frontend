import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationApiService } from '../../data-access/organization-api.service';
import { PersonnelAssignment } from '../../data-access/organization.dtos';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
    if (!branchId) {
      this.staff.set([]);
      this.total.set(0);
      return;
    }
    
    this.isLoading.set(true);
    this.api.getBranchPersonnel(branchId).subscribe({
      next: (res) => {
        this.staff.set(res);
        this.total.set(res.length);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterChange() {
    this.loadStaff();
  }
}
