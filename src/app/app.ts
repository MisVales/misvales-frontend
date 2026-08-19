import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MfaReauthModalComponent } from './core/components/mfa-reauth-modal/mfa-reauth-modal.component';
import { SessionExpiredDialogComponent } from './core/components/session-expired-dialog/session-expired-dialog.component';
import { SessionExpiredService } from './core/session/session-expired.service';
import { AlertComponent } from './shared/components/alert/alert.component';
import { ConfirmationHostComponent } from './shared/ui/confirmation-host/confirmation-host.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MfaReauthModalComponent,
    SessionExpiredDialogComponent,
    AlertComponent,
    ConfirmationHostComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('misvales-frontend');
  protected readonly sessionExpired = inject(SessionExpiredService);
}
