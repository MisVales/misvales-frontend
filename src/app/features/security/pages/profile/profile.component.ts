import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStore } from '../../../../core/session/session.store';
import { LucideAngularModule } from 'lucide-angular';
import { DelinquencyStatus, RiesgoApiService } from '../../../delinquency/riesgo-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  sessionStore = inject(SessionStore);
  private readonly riskApi = inject(RiesgoApiService);
  readonly accountStatus = signal<DelinquencyStatus | null>(null);
  readonly accountStatusLoading = signal(true);

  constructor() {
    this.riskApi.me().subscribe({
      next: (status) => {
        this.accountStatus.set(status);
        this.accountStatusLoading.set(false);
      },
      error: () => this.accountStatusLoading.set(false),
    });
  }
}
