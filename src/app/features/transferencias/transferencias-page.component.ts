import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../core/session/session.store';
import {
  ClientTransfer,
  OrganizationalChange,
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

      @if (canInitiate()) {
        <form
          class="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3"
          (ngSubmit)="initiate()"
        >
          <label class="text-sm"
            >Cliente<input
              class="mt-1 w-full rounded border p-2"
              name="client"
              [(ngModel)]="clientId"
              required
          /></label>
          <label class="text-sm"
            >Distribuidora receptora<input
              class="mt-1 w-full rounded border p-2"
              name="destination"
              [(ngModel)]="destinationDistributorId"
              required
          /></label>
          <button class="self-end rounded bg-indigo-700 px-4 py-2 text-white">
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
                @if (canReceive() && transfer.status === 'REQUESTED') {
                  <button class="rounded border px-3 py-2" (click)="preaccept(transfer, true)">
                    Preaceptar
                  </button>
                  <button class="rounded border px-3 py-2" (click)="preaccept(transfer, false)">
                    Rechazar
                  </button>
                }
                @if (canDecide() && transfer.status === 'PREACCEPTED') {
                  <button class="rounded border px-3 py-2" (click)="originDecision(transfer, true)">
                    Autorizar salida
                  </button>
                  <button
                    class="rounded border px-3 py-2"
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
  private readonly session = inject(SessionStore);
  readonly transfers = signal<ClientTransfer[]>([]);
  readonly history = signal<OrganizationalChange[]>([]);
  readonly message = signal('');
  clientId = '';
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
    if (!this.reason) return;
    this.api
      .originDecision(transfer.id, authorize, this.reason)
      .subscribe(() => this.done('Decisión de salida registrada.'));
  }
  complete(transfer: ClientTransfer): void {
    this.api
      .complete(transfer.id)
      .subscribe(() => this.done('Transferencia completada; el siguiente vale será digital.'));
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
