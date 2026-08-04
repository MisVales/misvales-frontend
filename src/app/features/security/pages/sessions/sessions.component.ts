import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

interface SessionItem {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  isRevoking?: boolean;
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent {
  sessions = signal<SessionItem[]>([
    { id: '1', device: 'Chrome on Windows', ip: '192.168.1.5', lastActive: new Date().toISOString(), isCurrent: true },
    { id: '2', device: 'Safari on iPhone', ip: '192.168.1.10', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
    { id: '3', device: 'Firefox on Linux', ip: '10.0.0.5', lastActive: new Date(Date.now() - 172800000).toISOString(), isCurrent: false },
  ]);

  sessionToRevoke = signal<string | null>(null);

  openRevokeModal(id: string) {
    this.sessionToRevoke.set(id);
  }

  closeRevokeModal() {
    this.sessionToRevoke.set(null);
  }

  confirmRevoke() {
    const id = this.sessionToRevoke();
    if (!id) return;
    this.closeRevokeModal();
    
    this.sessions.update(sessions => 
      sessions.map(s => s.id === id ? { ...s, isRevoking: true } : s)
    );

    // Simulate API call
    setTimeout(() => {
      this.sessions.update(sessions => sessions.filter(s => s.id !== id));
    }, 1200);
  }
}
