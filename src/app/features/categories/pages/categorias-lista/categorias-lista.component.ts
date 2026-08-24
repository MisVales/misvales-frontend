import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasStore } from '../../estado/categorias.store';
import { RouterModule } from '@angular/router';
import { CategoriasService } from '../../data-access/categorias.service';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { ReasonActionDialogComponent } from '../../../../shared/dialogs/reason-action-dialog/reason-action-dialog.component';
import { MisvalesDateTimePipe } from '../../../../shared/pipes/misvales-date-time.pipe';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-categorias-lista',
  imports: [CommonModule, RouterModule, ReasonActionDialogComponent, MisvalesDateTimePipe, StatusLabelPipe],
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriasListaComponent implements OnInit {
  protected readonly store = inject(CategoriasStore);
  private readonly api = inject(CategoriasService);
  protected readonly session = inject(SessionStore);
  readonly pendingPublication = signal<{ versionId: string; lockVersion: number } | null>(null);
  readonly publicationReason = signal('');
  readonly actionError = signal('');
  readonly actionLoading = signal(false);

  ngOnInit(): void {
    this.store.listar();
  }

  canManageCatalogs(): boolean {
    const permissions = this.session.permissions();
    return permissions.includes('catalogs.manage') || permissions.includes('all');
  }

  isGeneralManager(): boolean {
    return this.session.roles().includes('general_manager');
  }

  requestPublication(versionId: string, lockVersion: number): void {
    this.publicationReason.set('');
    this.actionError.set('');
    this.pendingPublication.set({ versionId, lockVersion });
  }

  closePublication(): void { this.pendingPublication.set(null); }

  async confirmPublication(): Promise<void> {
    const pending = this.pendingPublication();
    const reason = this.publicationReason().trim();
    if (!pending || !reason || this.actionLoading()) return;
    this.actionLoading.set(true);
    this.actionError.set('');
    try {
      await firstValueFrom(this.api.publicarVersion(pending.versionId, pending.lockVersion, reason));
      this.closePublication();
      await this.store.listar();
    } catch (error: unknown) {
      this.actionError.set(apiErrorMessage(error, 'No fue posible activar la categoría.'));
    } finally { this.actionLoading.set(false); }
  }
}
