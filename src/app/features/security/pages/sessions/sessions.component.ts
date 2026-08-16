import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from '../../data-access/security.service';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { MisvalesDateTimePipe } from '../../../../shared/pipes/misvales-date-time.pipe';

interface SessionItem {
  id: string;
  user_agent: string;
  ip_address: string;
  last_activity: string;
  is_current: boolean;
  isRevoking?: boolean;
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MisvalesDateTimePipe],
  templateUrl: './sessions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent implements OnInit {
  private securityService = inject(SecurityService);

  sessions = signal<SessionItem[]>([]);
  loading = signal(true);
  error = signal('');
  sessionToRevoke = signal<string | null>(null);
  revokeAllOpen = signal(false);

  async ngOnInit() {
    await this.loadSessions();
  }

  async loadSessions() {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.securityService.getSessions());
      const mapped = response.map(r => ({
        id: r.id,
        user_agent: r.device_name || r.user_agent,
        ip_address: r.ip_address,
        last_activity: r.last_activity_at,
        is_current: r.is_current,
        isRevoking: false
      }));
      this.sessions.set(mapped);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No se pudieron cargar las sesiones activas.'));
    } finally {
      this.loading.set(false);
    }
  }

  openRevokeModal(id: string) {
    this.sessionToRevoke.set(id);
  }

  closeRevokeModal() {
    this.sessionToRevoke.set(null);
  }

  async confirmRevoke() {
    const id = this.sessionToRevoke();
    if (!id) return;
    this.closeRevokeModal();
    
    this.sessions.update(sessions => 
      sessions.map(s => s.id === id ? { ...s, isRevoking: true } : s)
    );

    try {
      await firstValueFrom(this.securityService.closeSession(id));
      this.sessions.update(sessions => sessions.filter(s => s.id !== id));
    } catch (error: unknown) {
      this.sessions.update(sessions => 
        sessions.map(s => s.id === id ? { ...s, isRevoking: false } : s)
      );
      this.error.set(apiErrorMessage(error, 'No fue posible cerrar la sesión.'));
    }
  }

  openRevokeAllModal(): void {
    this.revokeAllOpen.set(true);
  }

  closeRevokeAllModal(): void {
    this.revokeAllOpen.set(false);
  }

  async confirmRevokeAll(): Promise<void> {
    this.closeRevokeAllModal();
    this.loading.set(true);
    try {
      await firstValueFrom(this.securityService.closeAllOtherSessions());
      this.sessions.update(sessions => sessions.filter(s => s.is_current));
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cerrar las demás sesiones.'));
    } finally {
      this.loading.set(false);
    }
  }
}
