import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../core/session/session.store';
import { PointsView, PuntosApiService, Redemption } from './puntos-api.service';
@Component({
  selector: 'app-puntos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<section class="space-y-6 p-6">
    <header>
      <p class="text-xs font-semibold uppercase text-gray-500">M15</p>
      <h1 class="text-2xl font-bold">Puntos y canjes</h1>
      <p class="text-sm text-gray-600">Libro separado de pagos y línea de crédito.</p>
    </header>
    @if (view(); as v) {
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border bg-white p-5">
          <span>Saldo</span><strong class="block text-3xl">{{ v.account.balance }}</strong>
        </div>
        <div class="rounded-xl border bg-white p-5">
          <span>Disponibles</span><strong class="block text-3xl">{{ v.available }}</strong>
        </div>
        <div class="rounded-xl border bg-white p-5">
          <span>Equivalente estimado</span
          ><strong class="block text-3xl">{{ v.estimated_value | currency: 'MXN' }}</strong>
        </div>
      </div>
      @if (v.period) {
        <form class="rounded-xl border bg-white p-5" (ngSubmit)="redeem()">
          <h2 class="font-bold">Periodo {{ v.period.name }}</h2>
          <p>Cierra {{ v.period.ends_at | date: 'medium' }}</p>
          <input
            type="number"
            min="1"
            class="mt-3 rounded-lg border p-2"
            [(ngModel)]="points"
            name="points"
            required
          /><button class="ml-2 rounded-lg bg-blue-700 px-4 py-2 text-white">
            Solicitar canje
          </button>
        </form>
      } @else {
        <div class="rounded-xl bg-amber-50 p-4">Canje cerrado: no existe periodo abierto.</div>
      }
      <section>
        <h2 class="font-bold">Historial</h2>
        @for (m of v.movements; track m.id) {
          <div class="mt-2 rounded-lg border bg-white p-3">
            <strong>{{ m.type }}</strong> · saldo {{ m.balance_after }}
            <p>
              Generados {{ m.generated }} · descontados {{ m.discounted }} · canjeados
              {{ m.redeemed }}
            </p>
          </div>
        }
      </section>
    }
    @if (canManage()) {
      <section>
        <h2 class="font-bold">Solicitudes</h2>
        @for (r of requests(); track r.id) {
          <article class="mt-2 rounded-xl border bg-white p-4">
            <strong>{{ r.points }} puntos · {{ r.monetary_value | currency: 'MXN' }}</strong> ·
            {{ r.status }}
            @if (r.status === 'REQUESTED' && canAuthorize()) {
              <input
                class="mx-2 rounded-lg border p-2"
                [(ngModel)]="reason"
                placeholder="Motivo"
              /><button (click)="decide(r, 'AUTHORIZE')">Autorizar</button> ·
              <button (click)="decide(r, 'REJECT')">Rechazar</button>
            }
            @if (r.status === 'AUTHORIZED' && canDeliver()) {
              <input
                class="mx-2 rounded-lg border p-2"
                [(ngModel)]="reference"
                placeholder="Referencia entrega"
              /><button (click)="deliver(r)">Registrar entrega</button>
            }
          </article>
        }
      </section>
    }
  </section>`,
})
export class PuntosPageComponent {
  private readonly api = inject(PuntosApiService);
  private readonly session = inject(SessionStore);
  readonly view = signal<PointsView | null>(null);
  readonly requests = signal<Redemption[]>([]);
  points = 1;
  reason = '';
  reference = '';
  constructor() {
    this.load();
  }
  canAuthorize(): boolean {
    return this.session
      .permissions()
      .some((p) => ['points.authorize_branch', 'points.authorize_global'].includes(p));
  }
  canDeliver(): boolean {
    return this.session.permissions().includes('points.deliver_branch');
  }
  canManage(): boolean {
    return this.canAuthorize() || this.canDeliver();
  }
  redeem(): void {
    this.api.request(this.points).subscribe(() => this.load());
  }
  decide(r: Redemption, d: 'AUTHORIZE' | 'REJECT'): void {
    if (!this.reason) return;
    this.api.decide(r.id, d, this.reason).subscribe(() => this.load());
  }
  deliver(r: Redemption): void {
    if (!this.reference) return;
    this.api.deliver(r.id, this.reference).subscribe(() => this.load());
  }
  private load(): void {
    if (
      this.session.roles().includes('distributor') &&
      this.session.permissions().includes('points.view_own')
    )
      this.api.account().subscribe((v) => this.view.set(v));
    if (this.canManage()) this.api.requests().subscribe((v) => this.requests.set(v));
  }
}
