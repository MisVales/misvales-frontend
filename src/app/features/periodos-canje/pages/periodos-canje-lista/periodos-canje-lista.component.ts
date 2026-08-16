import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodosCanjeStore } from '../../estado/periodos-canje.store';
import { RouterModule } from '@angular/router';
import { PeriodosCanjeService } from '../../data-access/periodos-canje.service';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { ReasonActionDialogComponent } from '../../../../shared/ui/reason-action-dialog/reason-action-dialog.component';
import { MisvalesDateTimePipe } from '../../../../shared/pipes/misvales-date-time.pipe';

@Component({
  selector: 'app-periodos-canje-lista',
  imports: [CommonModule, RouterModule, ReasonActionDialogComponent, MisvalesDateTimePipe],
  templateUrl: './periodos-canje-lista.component.html',
  styleUrls: ['./periodos-canje-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodosCanjeListaComponent implements OnInit {
  protected readonly store = inject(PeriodosCanjeStore);
  private readonly api = inject(PeriodosCanjeService);
  protected readonly session = inject(SessionStore);
  readonly pendingAction = signal<{ type: 'publish' | 'cancel'; id: string; lockVersion: number } | null>(null);
  readonly actionReason = signal('');
  readonly actionError = signal('');
  readonly actionLoading = signal(false);

  ngOnInit(): void {
    this.store.listar();
  }

  requestAction(type: 'publish' | 'cancel', id: string, lockVersion: number): void {
    this.actionReason.set(''); this.actionError.set(''); this.pendingAction.set({ type, id, lockVersion });
  }
  closeAction(): void { this.pendingAction.set(null); }
  async confirmAction(): Promise<void> {
    const pending = this.pendingAction(); const reason = this.actionReason().trim();
    if (!pending || !reason || this.actionLoading()) return;
    this.actionLoading.set(true); this.actionError.set('');
    try {
      const request = pending.type === 'publish'
        ? this.api.publicar(pending.id, pending.lockVersion, reason)
        : this.api.cancelar(pending.id, pending.lockVersion, reason);
      await firstValueFrom(request); this.closeAction(); await this.store.listar();
    } catch (error: unknown) {
      this.actionError.set(apiErrorMessage(error, pending.type === 'publish' ? 'No fue posible publicar el periodo.' : 'No fue posible cancelar el periodo.'));
    } finally { this.actionLoading.set(false); }
  }
}
