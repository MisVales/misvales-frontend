import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../core/session/session.store';
import { ClientesApiService } from '../clientes/data-access/api/clientes-api.service';
import { Cliente } from '../clientes/models/cliente.model';
import {
  ClientTransfer,
  OrganizationalChange,
  TransferDestination,
  TransferenciasApiService,
} from './transferencias-api.service';

@Component({
  selector: 'app-transferencias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6 p-4 md:p-6">
      <header>
        <p class="text-xs font-semibold uppercase text-gray-500">M17</p>
        <h1 class="text-2xl font-bold">Transferencias y cambios organizacionales</h1>
        <p class="text-sm text-gray-600">
          Cada cambio conserva origen, destino, responsables e historial. El saldo cero se valida
          exclusivamente al transferir clientes.
        </p>
      </header>
      <ol
        class="grid gap-2 text-xs font-semibold sm:grid-cols-5"
        aria-label="Etapas de transferencia"
      >
        <li class="rounded-lg border bg-white p-2">1 Solicitud</li>
        <li class="rounded-lg border bg-white p-2">2 Preaceptación receptora</li>
        <li class="rounded-lg border bg-white p-2">3 Autorización de salida</li>
        <li class="rounded-lg border bg-white p-2">4 Aceptación definitiva</li>
        <li class="rounded-lg border bg-white p-2">5 Completada</li>
      </ol>

      @if (canInitiate()) {
        <form
          class="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3"
          (ngSubmit)="initiate()"
        >
          <label class="text-sm md:col-span-3"
            >Buscar cliente<input
              class="mt-1 w-full rounded border p-2"
              name="clientSearch"
              [(ngModel)]="clientSearch"
              (ngModelChange)="searchClients()"
              placeholder="Nombre o número de cliente"
          /></label>
          <label class="text-sm"
            >Cliente<select
              class="mt-1 w-full rounded border p-2"
              name="client"
              [(ngModel)]="clientId"
              required
            >
              <option value="">Selecciona un cliente</option>
              @for (client of clients(); track client.id) {
                <option [value]="client.id">
                  {{ client.numero }} — {{ client.nombreCompleto }}
                </option>
              }
            </select></label
          >
          <label class="text-sm"
            >Distribuidora receptora<select
              class="mt-1 w-full rounded border p-2"
              name="destination"
              [(ngModel)]="destinationDistributorId"
              required
            >
              <option value="">Selecciona una distribuidora</option>
              @for (destination of destinations(); track destination.id) {
                <option [value]="destination.id">
                  {{ destination.distributor_number }} — {{ destination.full_name }}
                  @if (destination.branch) {
                    · {{ destination.branch.name }}
                  }
                </option>
              }
            </select></label
          >
          <button
            class="self-end rounded bg-indigo-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="!clientId || !destinationDistributorId"
          >
            Iniciar transferencia
          </button>
        </form>
      }

      <section>
        <h2 class="font-bold">Solicitudes</h2>
        <div class="mt-3 grid gap-3 lg:grid-cols-2">
          @for (transfer of transfers(); track transfer.id) {
            <article class="rounded-xl border bg-white p-4 text-sm">
              <div class="flex items-center justify-between gap-2">
                <strong>{{ transfer.status }}</strong
                ><span>{{ transfer.id }}</span>
              </div>
              <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt>Cliente</dt>
                <dd>{{ transfer.client_id }}</dd>
                <dt>Origen</dt>
                <dd>{{ transfer.origin_distributor_id }}</dd>
                <dt>Destino</dt>
                <dd>{{ transfer.destination_distributor_id }}</dd>
                <dt>Responsable inicial</dt>
                <dd>{{ transfer.initiated_by }}</dd>
              </dl>
              @if (transfer.origin_decision_reason) {
                <p class="mt-2">Motivo: {{ transfer.origin_decision_reason }}</p>
              }
              <div class="mt-3 flex flex-wrap gap-2">
                <p class="w-full rounded bg-gray-50 p-2 text-xs">
                  <strong>Siguiente responsable:</strong>
                  {{
                    transfer.status === 'REQUESTED'
                      ? 'Distribuidora receptora'
                      : transfer.status === 'PREACCEPTED'
                        ? 'Distribuidora de origen'
                        : transfer.status === 'ORIGIN_AUTHORIZED'
                          ? 'Distribuidora receptora'
                          : 'Proceso cerrado'
                  }}
                </p>
                @if (canReceive() && transfer.status === 'REQUESTED') {
                  <button class="rounded border px-3 py-2" (click)="preaccept(transfer, true)">
                    Preaceptar
                  </button>
                  <button class="rounded border px-3 py-2" (click)="preaccept(transfer, false)">
                    Rechazar
                  </button>
                }
                @if (canDecide() && transfer.status === 'PREACCEPTED') {
                  <label class="w-full text-sm font-medium">
                    Motivo de la decisión de salida
                    <textarea
                      class="mt-1 w-full rounded border p-2 font-normal"
                      [ngModel]="decisionReasons[transfer.id] ?? ''"
                      (ngModelChange)="decisionReasons[transfer.id] = $event"
                      placeholder="Explique por qué autoriza o rechaza la salida"
                      required
                    ></textarea>
                  </label>
                  <button
                    class="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="!decisionReasons[transfer.id]?.trim()"
                    (click)="originDecision(transfer, true)"
                  >
                    Autorizar salida
                  </button>
                  <button
                    class="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="!decisionReasons[transfer.id]?.trim()"
                    (click)="originDecision(transfer, false)"
                  >
                    Rechazar salida
                  </button>
                }
                @if (canReceive() && transfer.status === 'ORIGIN_AUTHORIZED') {
                  <button
                    class="rounded bg-indigo-700 px-3 py-2 text-white"
                    (click)="complete(transfer)"
                  >
                    Aceptación definitiva
                  </button>
                }
                @if (canCancel(transfer)) {
                  <label class="w-full text-sm font-medium">
                    Motivo de cancelación
                    <textarea
                      class="mt-1 w-full rounded border p-2 font-normal"
                      [ngModel]="cancellationReasons[transfer.id] ?? ''"
                      (ngModelChange)="cancellationReasons[transfer.id] = $event"
                      placeholder="Explique por qué se cancela la transferencia"
                      required
                    ></textarea>
                  </label>
                  <button
                    class="rounded border border-red-300 px-3 py-2 text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="!cancellationReasons[transfer.id]?.trim()"
                    (click)="cancel(transfer)"
                  >
                    Cancelar transferencia
                  </button>
                }
              </div>
            </article>
          } @empty {
            <p class="rounded-xl border border-dashed p-4 text-gray-500">
              No hay transferencias visibles.
            </p>
          }
        </div>
      </section>

      @if (canManage()) {
        <section class="space-y-3">
          <h2 class="font-bold">Operaciones gerenciales</h2>
          <textarea
            class="w-full rounded border p-2"
            [(ngModel)]="reason"
            placeholder="Motivo obligatorio y evidencia"
          ></textarea>
          <div class="grid gap-3 lg:grid-cols-3">
            <form class="space-y-2 rounded-xl border bg-white p-4" (ngSubmit)="reassignClient()">
              <strong>Reasignar cliente</strong>
              <input
                class="w-full rounded border p-2"
                name="adminClient"
                [(ngModel)]="adminClientId"
                placeholder="Cliente"
                required
              />
              <input
                class="w-full rounded border p-2"
                name="adminDestination"
                [(ngModel)]="adminDestinationId"
                placeholder="Distribuidora destino"
                required
              />
              <button class="rounded border px-3 py-2">Reasignar</button>
            </form>
            <form class="space-y-2 rounded-xl border bg-white p-4" (ngSubmit)="changeBranch()">
              <strong>Cambiar sucursal</strong>
              <input
                class="w-full rounded border p-2"
                name="branchDistributor"
                [(ngModel)]="managerDistributorId"
                placeholder="Distribuidora"
                required
              />
              <input
                class="w-full rounded border p-2"
                name="destinationBranch"
                [(ngModel)]="destinationBranchId"
                placeholder="Sucursal destino"
                required
              />
              <input
                class="w-full rounded border p-2"
                name="branchCoordinator"
                [(ngModel)]="destinationCoordinatorId"
                placeholder="Coordinador destino"
                required
              />
              <button class="rounded border px-3 py-2">
                Cambiar después de reasignar clientes
              </button>
            </form>
            <form class="space-y-2 rounded-xl border bg-white p-4" (ngSubmit)="changeCoordinator()">
              <strong>Cambiar coordinador</strong>
              <input
                class="w-full rounded border p-2"
                name="coordinatorDistributor"
                [(ngModel)]="managerDistributorId"
                placeholder="Distribuidora"
                required
              />
              <input
                class="w-full rounded border p-2"
                name="destinationCoordinator"
                [(ngModel)]="destinationCoordinatorId"
                placeholder="Coordinador destino"
                required
              />
              <button class="rounded border px-3 py-2">Reasignar coordinador</button>
            </form>
          </div>
          <form class="space-y-2 rounded-xl border bg-white p-4" (ngSubmit)="coordinatorExit()">
            <strong>Salida de coordinador</strong>
            <p class="text-sm text-gray-600">
              Incluya todas sus distribuidoras; una por línea como distribuidora:coordinador
              destino.
            </p>
            <input
              class="w-full rounded border p-2"
              name="originCoordinator"
              [(ngModel)]="originCoordinatorId"
              placeholder="Coordinador que sale"
              required
            />
            <textarea
              class="w-full rounded border p-2"
              name="exitAssignments"
              [(ngModel)]="exitAssignments"
              placeholder="uuid-distribuidora:uuid-coordinador"
            ></textarea>
            <button class="rounded border px-3 py-2">Reasignar todas</button>
          </form>
        </section>
      }

      @if (canViewHistory()) {
        <section>
          <h2 class="font-bold">Historial organizacional</h2>
          @for (change of history(); track change.id) {
            <article class="mt-2 rounded-xl border bg-white p-3 text-sm">
              <strong>{{ change.type }}</strong>
              <p>{{ change.reason }}</p>
              <p>Responsable y fecha: {{ change.occurred_at | date: 'medium' }}</p>
            </article>
          }
        </section>
      }
      @if (message()) {
        <p class="rounded bg-emerald-50 p-3 text-emerald-800">{{ message() }}</p>
      }
    </section>
  `,
})
export class TransferenciasPageComponent {
  private readonly api = inject(TransferenciasApiService);
  private readonly clientsApi = inject(ClientesApiService);
  private readonly session = inject(SessionStore);
  readonly transfers = signal<ClientTransfer[]>([]);
  readonly history = signal<OrganizationalChange[]>([]);
  readonly clients = signal<Cliente[]>([]);
  readonly destinations = signal<TransferDestination[]>([]);
  readonly message = signal('');
  readonly decisionReasons: Record<string, string> = {};
  readonly cancellationReasons: Record<string, string> = {};
  clientId = '';
  clientSearch = '';
  destinationDistributorId = '';
  reason = '';
  adminClientId = '';
  adminDestinationId = '';
  managerDistributorId = '';
  destinationBranchId = '';
  destinationCoordinatorId = '';
  originCoordinatorId = '';
  exitAssignments = '';

  constructor() {
    this.load();
    if (this.canInitiate()) {
      this.searchClients();
      this.loadDestinations();
    }
  }
  canInitiate(): boolean {
    return this.has('client_transfers.initiate_own');
  }
  canReceive(): boolean {
    return this.has('client_transfers.receive_own');
  }
  canDecide(): boolean {
    return this.has('client_transfers.decide_assigned');
  }
  canManage(): boolean {
    return (
      this.has('organization_changes.manage_branch') ||
      this.has('organization_changes.manage_global')
    );
  }
  canViewHistory(): boolean {
    return this.has('organization_changes.view');
  }
  searchClients(): void {
    this.clientsApi
      .listar({ search: this.clientSearch, page: 1, perPage: 20 })
      .subscribe((page) => this.clients.set(page.data));
  }
  loadDestinations(): void {
    this.api.destinations().subscribe((destinations) => this.destinations.set(destinations));
  }
  canCancel(transfer: ClientTransfer): boolean {
    return (
      this.canInitiate() &&
      transfer.initiated_by === this.session.user()?.id &&
      ['REQUESTED', 'PREACCEPTED', 'ORIGIN_AUTHORIZED'].includes(transfer.status)
    );
  }

  initiate(): void {
    if (this.clientId && this.destinationDistributorId)
      this.api
        .initiate(this.clientId, this.destinationDistributorId)
        .subscribe(() => this.done('Transferencia solicitada.'));
  }
  preaccept(transfer: ClientTransfer, accept: boolean): void {
    this.api
      .preaccept(transfer.id, accept)
      .subscribe(() =>
        this.done(accept ? 'Transferencia preaceptada.' : 'Transferencia rechazada.'),
      );
  }
  originDecision(transfer: ClientTransfer, authorize: boolean): void {
    const reason = this.decisionReasons[transfer.id]?.trim();
    if (!reason) return;
    this.api.originDecision(transfer.id, authorize, reason).subscribe(() => {
      delete this.decisionReasons[transfer.id];
      this.done('Decisión de salida registrada.');
    });
  }
  complete(transfer: ClientTransfer): void {
    this.api
      .complete(transfer.id)
      .subscribe(() => this.done('Transferencia completada; el siguiente vale será digital.'));
  }
  cancel(transfer: ClientTransfer): void {
    const reason = this.cancellationReasons[transfer.id]?.trim();
    if (!reason) return;
    this.api.cancel(transfer.id, reason).subscribe(() => {
      delete this.cancellationReasons[transfer.id];
      this.done('Transferencia cancelada antes del cambio definitivo.');
    });
  }
  reassignClient(): void {
    if (!this.reason) return;
    this.api
      .reassignClient(this.adminClientId, this.adminDestinationId, this.reason)
      .subscribe(() => this.done('Cliente reasignado con historial.'));
  }
  changeBranch(): void {
    if (!this.reason) return;
    this.api
      .changeBranch(
        this.managerDistributorId,
        this.destinationBranchId,
        this.destinationCoordinatorId,
        this.reason,
      )
      .subscribe(() => this.done('Sucursal y coordinador destino actualizados.'));
  }
  changeCoordinator(): void {
    if (!this.reason) return;
    this.api
      .changeCoordinator(this.managerDistributorId, this.destinationCoordinatorId, this.reason)
      .subscribe(() => this.done('Coordinador reasignado.'));
  }
  coordinatorExit(): void {
    if (!this.reason) return;
    const assignments = this.exitAssignments
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [distributor_id, destination_coordinator_id] = line
          .split(':')
          .map((value) => value.trim());
        return { distributor_id, destination_coordinator_id };
      });
    if (
      !assignments.length ||
      assignments.some((item) => !item.distributor_id || !item.destination_coordinator_id)
    )
      return;
    this.api
      .coordinatorExit(this.originCoordinatorId, assignments, this.reason)
      .subscribe(() => this.done('Todas las distribuidoras fueron reasignadas.'));
  }

  private load(): void {
    if (this.has('client_transfers.view'))
      this.api.transfers().subscribe((items) => this.transfers.set(items));
    if (this.canViewHistory()) this.api.history().subscribe((items) => this.history.set(items));
  }
  private done(message: string): void {
    this.message.set(message);
    this.load();
  }
  private has(permission: string): boolean {
    return this.session.permissions().includes(permission);
  }
}
