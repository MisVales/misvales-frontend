import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStore } from '../../../../core/session/session.store';
import { LucideAngularModule } from 'lucide-angular';
import { DelinquencyStatus, RiesgoApiService } from '../../../delinquency/riesgo-api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  sessionStore = inject(SessionStore);
  private readonly riskApi = inject(RiesgoApiService);
  readonly accountStatus = signal<DelinquencyStatus | null>(null);
  readonly accountStatusLoading = signal(false);

  readonly isDistributor = this.sessionStore.roles().includes('distributor');
  readonly canViewPayments = this.hasAnyPermission(['relations.view_own']);
  readonly canViewPoints = this.hasAnyPermission(['points.view_own', 'points.redeem_own']);
  readonly canViewTransfers = this.hasAnyPermission(['client_transfers.view', 'client_transfers.create_own']);

  constructor() {
    if (!this.isDistributor) return;

    this.accountStatusLoading.set(true);
    this.riskApi.me().subscribe({
      next: (status) => {
        this.accountStatus.set(status);
        this.accountStatusLoading.set(false);
      },
      error: () => this.accountStatusLoading.set(false),
    });
  }

  private hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.sessionStore.permissions().includes(permission));
  }
}
