import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { SessionStore } from '../../core/session/session.store';
import { EmptyStateComponent } from '../../shared/components/status/empty-state/empty-state.component';
import {
  ClientTransfer,
  OrganizationalChange,
  TransferenciasApiService,
} from './transferencias-api.service';

type TransferFilter = 'all' | 'action' | 'progress' | 'closed';

@Component({
  selector: 'app-transferencias-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, EmptyStateComponent],
  templateUrl: './transferencias-page.component.html',
  styleUrl: './transferencias-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferenciasPageComponent implements OnInit {
  private readonly api = inject(TransferenciasApiService);
  private readonly session = inject(SessionStore);

  protected readonly transfers = signal<ClientTransfer[]>([]);
  protected readonly history = signal<OrganizationalChange[]>([]);
  protected readonly loading = signal(true);
  protected readonly partial = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly savingId = signal('');
  protected readonly filter = signal<TransferFilter>('all');
  protected readonly query = signal('');
  protected readonly decisionReasons: Record<string, string> = {};

  protected readonly canDecide = computed(() => this.has('client_transfers.decide_assigned'));
  protected readonly canViewHistory = computed(() => this.has('organization_changes.view'));
  protected readonly awaitingDecision = computed(
    () => this.transfers().filter((item) => item.status === 'PREACCEPTED').length,
  );
  protected readonly inProgress = computed(
    () =>
      this.transfers().filter((item) =>
        ['REQUESTED', 'PREACCEPTED', 'ORIGIN_AUTHORIZED'].includes(item.status),
      ).length,
  );
  protected readonly completed = computed(
    () => this.transfers().filter((item) => item.status === 'COMPLETED').length,
  );
  protected readonly filteredTransfers = computed(() => {
    const query = this.query().trim().toLowerCase();
    const filter = this.filter();
    return this.transfers().filter((item) => {
      const matchesQuery =
        !query ||
        [item.id, item.client_id, item.origin_distributor_id, item.destination_distributor_id]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'action' && item.status === 'PREACCEPTED') ||
        (filter === 'progress' &&
          ['REQUESTED', 'PREACCEPTED', 'ORIGIN_AUTHORIZED'].includes(item.status)) ||
        (filter === 'closed' &&
          [
            'COMPLETED',
            'REJECTED',
            'REJECTED_BY_RECEIVER',
            'ORIGIN_REJECTED',
            'CANCELLED',
          ].includes(item.status));
      return matchesQuery && matchesFilter;
    });
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected selectFilter(filter: TransferFilter): void {
    this.filter.set(filter);
  }

  protected setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected async decide(transfer: ClientTransfer, authorize: boolean): Promise<void> {
    const reason = this.decisionReasons[transfer.id]?.trim();
    if (!reason || this.savingId()) return;

    this.savingId.set(transfer.id);
    this.error.set('');
    this.success.set('');
    try {
      await firstValueFrom(this.api.originDecision(transfer.id, authorize, reason));
      delete this.decisionReasons[transfer.id];
      this.success.set(
        authorize
          ? 'La salida del cliente fue autorizada.'
          : 'La salida del cliente fue rechazada.',
      );
      await this.load(false);
    } catch {
      this.error.set('No fue posible registrar la decisión. Revisa el estado y vuelve a intentar.');
    } finally {
      this.savingId.set('');
    }
  }

  protected statusLabel(status: string): string {
    return (
      {
        REQUESTED: 'Solicitada',
        PREACCEPTED: 'Por autorizar salida',
        ORIGIN_AUTHORIZED: 'Salida autorizada',
        COMPLETED: 'Completada',
        REJECTED: 'Rechazada',
        REJECTED_BY_RECEIVER: 'Rechazada por destino',
        ORIGIN_REJECTED: 'Salida rechazada',
        CANCELLED: 'Cancelada',
      }[status] ?? status.replaceAll('_', ' ')
    );
  }

  protected nextStep(status: string): string {
    return (
      {
        REQUESTED: 'Preaceptación de la distribuidora receptora',
        PREACCEPTED: 'Decisión del coordinador de origen',
        ORIGIN_AUTHORIZED: 'Aceptación definitiva de la receptora',
        COMPLETED: 'Proceso concluido',
        REJECTED: 'Proceso cerrado',
        REJECTED_BY_RECEIVER: 'Proceso cerrado',
        ORIGIN_REJECTED: 'Proceso cerrado',
        CANCELLED: 'Proceso cerrado',
      }[status] ?? 'Seguimiento operativo'
    );
  }

  protected statusTone(status: string): string {
    if (status === 'COMPLETED') return 'green';
    if (status === 'PREACCEPTED') return 'orange';
    if (['REJECTED', 'REJECTED_BY_RECEIVER', 'ORIGIN_REJECTED', 'CANCELLED'].includes(status)) {
      return 'red';
    }
    return 'blue';
  }

  private async load(showLoading = true): Promise<void> {
    if (showLoading) this.loading.set(true);
    this.partial.set(false);
    const requests: Promise<void>[] = [];

    if (this.has('client_transfers.view') || this.canDecide()) {
      requests.push(
        firstValueFrom(this.api.transfers())
          .then((items) => this.transfers.set(items))
          .catch(() => {
            this.partial.set(true);
            this.transfers.set([]);
          }),
      );
    }
    if (this.canViewHistory()) {
      requests.push(
        firstValueFrom(this.api.history())
          .then((items) => this.history.set(items))
          .catch(() => {
            this.partial.set(true);
            this.history.set([]);
          }),
      );
    }

    await Promise.all(requests);
    if (this.partial()) {
      this.error.set(
        'Parte de la información no está disponible. Puedes continuar con lo visible.',
      );
    }
    this.loading.set(false);
  }

  private has(permission: string): boolean {
    const permissions = this.session.permissions();
    return permissions.includes('all') || permissions.includes(permission);
  }
}
