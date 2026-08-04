import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationApiService } from '../../data-access/organization-api.service';
import { StaffRes } from '../../data-access/organization.dtos';

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

  staff = signal<StaffRes[]>([]);
  isLoading = signal(true);
  total = signal(0);
  
  filterSearch = signal('');
  filterStatus = signal('');
  filterRole = signal('');
  filterBranch = signal('');

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.api.getStaff(1, 20, this.filterSearch(), this.filterStatus(), this.filterRole(), this.filterBranch())
      .subscribe({
        next: (res) => {
          this.staff.set(res.data);
          this.total.set(res.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  onFilterChange() {
    this.loadStaff();
  }
}
