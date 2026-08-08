import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizationApiService } from '../../data-access/organization-api.service';
// import { StaffRes } from '../../data-access/organization.dtos';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './staff-detail.html',
  styleUrls: ['./staff-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffDetail implements OnInit {
  private api = inject(OrganizationApiService);
  private route = inject(ActivatedRoute);

  staff = signal<any | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // this.api.getStaffById(id).subscribe({
      //   next: (res: any) => {
      //     this.staff.set(res);
      //     this.isLoading.set(false);
      //   },
      //   error: () => this.isLoading.set(false)
      // });
      this.isLoading.set(false);
    }
  }
}
