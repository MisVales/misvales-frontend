import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MfaReauthModalComponent } from './core/auth/components/mfa-reauth-modal/mfa-reauth-modal.component';
import { SessionExpiredDialogComponent } from './core/session/components/session-expired-dialog/session-expired-dialog.component';
import { SessionExpiredService } from './core/session/session-expired.service';
import { AlertComponent } from './shared/components/alerts/global-alert/alert.component';
import { ConfirmationHostComponent } from './shared/dialogs/confirmation-host/confirmation-host.component';
import { RequestActivityService } from './core/observability/request-activity.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MfaReauthModalComponent,
    SessionExpiredDialogComponent,
    AlertComponent,
    ConfirmationHostComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly title = signal('misvales-frontend');
  protected readonly sessionExpired = inject(SessionExpiredService);
  protected readonly requestActivity = inject(RequestActivityService);
}
