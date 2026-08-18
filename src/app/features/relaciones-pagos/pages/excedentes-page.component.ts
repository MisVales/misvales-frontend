import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../../core/session/session.store';
import {
  ExcedentesApiService,
  RefundRequest,
  Surplus,
} from '../data-access/excedentes-api.service';
@Component({
  selector: 'app-excedentes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<section class="space-y-6 p-6">
    <header>
      <h1 class="text-2xl font-bold">Excedentes y devoluciones</h1>
      <p class="text-sm text-gray-600">
        El excedente nunca aumenta la línea por encima del total autorizado.
      </p>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
    }
    <div class="grid gap-4 lg:grid-cols-2">
      <section>
        <h2 class="mb-3 font-bold">Excedentes</h2>
        @for (item of surpluses(); track item.id) {
          <article class="mb-3 rounded-xl border bg-white p-4">
            <div class="flex justify-between">
              <strong>{{ item.original_amount | currency: 'MXN' }}</strong
              ><span>{{ item.status }}</span>
            </div>
            <p>
              Disponible {{ item.available_amount | currency: 'MXN' }} · reservado
              {{ item.reserved_amount | currency: 'MXN' }}
            </p>
            @if (item.status === 'PENDING_DECISION' && own()) {
              <div class="mt-3 flex gap-2">
                <button class="rounded-lg bg-blue-700 px-3 py-2 text-white" (click)="credit(item)">
                  Conservar saldo a favor</button
                ><button class="rounded-lg border px-3 py-2" (click)="refund(item)">
                  Solicitar devolución
                </button>
              </div>
            }
          </article>
        }
        @if (!surpluses().length) {
          <p class="text-gray-500">No hay excedentes visibles.</p>
        }
      </section>
      @if (canManage()) {
        <section>
          <h2 class="mb-3 font-bold">Solicitudes de devolución</h2>
          @for (item of refunds(); track item.id) {
            <article class="mb-3 rounded-xl border bg-white p-4">
              <strong>{{ item.amount | currency: 'MXN' }}</strong> · {{ item.status }}
              @if (item.status === 'REQUESTED' && canAuthorize()) {
                <textarea
                  class="my-2 w-full rounded-lg border p-2"
                  [(ngModel)]="reason"
                  placeholder="Motivo"
                ></textarea
                ><button
                  class="mr-2 rounded-lg bg-blue-700 px-3 py-2 text-white"
                  (click)="decide(item, 'AUTHORIZE')"
                >
                  Autorizar</button
                ><button class="rounded-lg border px-3 py-2" (click)="decide(item, 'REJECT')">
                  Rechazar
                </button>
              }
              @if (item.status === 'AUTHORIZED' && canExecute()) {
                <div class="mt-3 space-y-2">
                  <input
                    class="w-full rounded-lg border p-2"
                    [(ngModel)]="method"
                    placeholder="Método externo"
                  /><input
                    class="w-full rounded-lg border p-2"
                    [(ngModel)]="reference"
                    placeholder="Referencia"
                  /><input
                    class="w-full rounded-lg border p-2"
                    [(ngModel)]="evidence"
                    placeholder="ID de evidencia privada"
                  /><button
                    class="rounded-lg bg-emerald-700 px-3 py-2 text-white"
                    (click)="execute(item)"
                  >
                    Registrar devolución ejecutada
                  </button>
                </div>
              }
            </article>
          }
        </section>
      }
    </div>
  </section>`,
})
export class ExcedentesPageComponent {
  private readonly api = inject(ExcedentesApiService);
  private readonly session = inject(SessionStore);
  readonly surpluses = signal<Surplus[]>([]);
  readonly refunds = signal<RefundRequest[]>([]);
  readonly error = signal('');
  reason = '';
  method = '';
  reference = '';
  evidence = '';
  constructor() {
    this.load();
  }
  own(): boolean {
    return this.session.permissions().includes('surpluses.view_own');
  }
  canAuthorize(): boolean {
    return this.session
      .permissions()
      .some((p) => ['refunds.authorize_branch', 'refunds.authorize_global'].includes(p));
  }
  canExecute(): boolean {
    return this.session.permissions().includes('refunds.execute_branch');
  }
  canManage(): boolean {
    return this.canAuthorize() || this.canExecute();
  }
  credit(i: Surplus): void {
    this.api.credit(i.id).subscribe({ next: () => this.load(), error: () => this.fail() });
  }
  refund(i: Surplus): void {
    this.api.refund(i.id).subscribe({ next: () => this.load(), error: () => this.fail() });
  }
  decide(i: RefundRequest, d: 'AUTHORIZE' | 'REJECT'): void {
    if (!this.reason) return;
    this.api
      .decide(i.id, d, this.reason)
      .subscribe({ next: () => this.load(), error: () => this.fail() });
  }
  execute(i: RefundRequest): void {
    if (!this.method || !this.reference || !this.evidence) return;
    this.api
      .execute(i.id, this.method, this.reference, this.evidence)
      .subscribe({ next: () => this.load(), error: () => this.fail() });
  }
  private load(): void {
    this.api.list().subscribe({ next: (v) => this.surpluses.set(v), error: () => this.fail() });
    if (this.canManage())
      this.api.refunds().subscribe({ next: (v) => this.refunds.set(v), error: () => this.fail() });
  }
  private fail(): void {
    this.error.set('No fue posible completar la operación.');
  }
}
