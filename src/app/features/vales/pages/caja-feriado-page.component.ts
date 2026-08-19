import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionStore } from '../../../core/session/session.store';
import {
  CajaValesApiService,
  CashVoucher,
  ModificationRequest,
} from '../data-access/caja-vales-api.service';

@Component({
  selector: 'app-caja-feriado-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<section class="space-y-6 p-6">
    <header>
      <h1 class="text-2xl font-bold">Caja y feriado</h1>
      <p class="text-sm text-gray-600">
        MisVales registra el depósito manual; no ejecuta operaciones bancarias.
      </p>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <strong>{{ errorCode() }}</strong> {{ error() }}
      </div>
    }
    @if (canCash()) {
      <div class="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <div class="space-y-4">
          <form class="rounded-xl border bg-white p-4" (ngSubmit)="searchVouchers()">
            <label class="block text-sm"
              >Folio o nombre<input
                class="mt-1 w-full rounded-lg border p-2"
                [(ngModel)]="search"
                name="search"
                minlength="2"
                required /></label
            ><button class="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-white">Buscar</button>
          </form>
          @for (voucher of results(); track voucher.id) {
            <button
              class="block w-full rounded-xl border bg-white p-4 text-left hover:bg-blue-50"
              (click)="open(voucher.id)"
            >
              <strong>{{ voucher.folio }}</strong
              ><br />{{ voucher.client?.full_name }} · {{ voucher.status }}
            </button>
          }
        </div>
        @if (selected(); as voucher) {
          <article class="space-y-5 rounded-xl border bg-white p-5">
            <div class="flex justify-between">
              <div>
                <h2 class="text-xl font-bold">{{ voucher.folio }}</h2>
                <p>{{ voucher.type }} · {{ voucher.status }}</p>
              </div>
              <strong>{{ voucher.capital | currency: 'MXN' }}</strong>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <section>
                <h3 class="font-bold">Identidad</h3>
                <p>{{ voucher.client?.full_name }}</p>
                <p>
                  {{ voucher.identity?.official_id_type }} ·
                  {{ voucher.identity?.official_id_number }}
                </p>
              </section>
              <section>
                <h3 class="font-bold">Domicilio</h3>
                <p>
                  {{ voucher.address?.['street'] }} {{ voucher.address?.['exterior_number'] }},
                  {{ voucher.address?.['neighborhood'] }}, {{ voucher.address?.['postal_code'] }}
                </p>
              </section>
              <section>
                <h3 class="font-bold">Cuenta</h3>
                <p>
                  {{ voucher.bank_account?.bank_name }} · {{ voucher.bank_account?.clabe_masked }}
                </p>
              </section>
              <section>
                <h3 class="font-bold">Producto</h3>
                <p>
                  {{ voucher.product?.name }} ·
                  {{ voucher.client_payment_per_fortnight | currency: 'MXN' }}/quincena
                </p>
              </section>
            </div>
            @if (voucher.status === 'GENERATED') {
              <div class="flex flex-wrap gap-2">
                <button
                  class="rounded-lg bg-emerald-700 px-4 py-2 text-white"
                  [disabled]="busy()"
                  (click)="release(voucher)"
                >
                  Identidad coincide: liberar</button
                ><button class="rounded-lg border px-4 py-2" (click)="showCorrection.set(true)">
                  Solicitar corrección
                </button>
              </div>
            }
            @if (showCorrection()) {
              <form
                class="space-y-3 rounded-lg bg-gray-50 p-4"
                (ngSubmit)="requestCorrection(voucher)"
              >
                <p class="font-semibold">Campos discrepantes</p>
                <label class="mr-4"
                  ><input type="checkbox" [(ngModel)]="correctCurp" name="curp" /> CURP</label
                ><label
                  ><input type="checkbox" [(ngModel)]="correctAddress" name="address" />
                  Domicilio</label
                ><textarea
                  class="block w-full rounded-lg border p-2"
                  [(ngModel)]="correctionReason"
                  name="reason"
                  maxlength="500"
                  placeholder="Motivo"
                  required
                ></textarea
                ><button class="rounded-lg bg-blue-700 px-4 py-2 text-white">
                  Enviar solicitud
                </button>
              </form>
            }
            @if (voucher.status === 'RELEASED') {
              <form class="space-y-3 rounded-lg bg-emerald-50 p-4" (ngSubmit)="cash(voucher)">
                <label class="block text-sm"
                  >Número de transacción del depósito manual<input
                    class="mt-1 w-full rounded-lg border p-2"
                    [(ngModel)]="transaction"
                    name="transaction"
                    required /></label
                ><label
                  ><input type="checkbox" [(ngModel)]="confirmed" name="confirmed" required />
                  Confirmo que el depósito se realizó fuera de MisVales</label
                ><button
                  class="block rounded-lg bg-emerald-700 px-4 py-2 text-white"
                  [disabled]="busy() || !confirmed"
                >
                  Feriar vale
                </button>
              </form>
            }
            @if (voucher.status === 'CORRECTION_PENDING') {
              <form class="space-y-3 rounded-lg bg-amber-50 p-4" (ngSubmit)="applyCorrection()">
                <p>
                  Introduce el token de 8 caracteres recibido. Vence en 5 minutos y es de un solo
                  uso.
                </p>
                <input
                  class="w-full rounded-lg border p-2"
                  [(ngModel)]="token"
                  name="token"
                  maxlength="8"
                  required
                  placeholder="Token"
                /><textarea
                  class="w-full rounded-lg border p-2"
                  [(ngModel)]="changesJson"
                  name="changes"
                  required
                  placeholder='Cambios JSON, por ejemplo {"curp":"..."}'
                ></textarea
                ><input
                  type="number"
                  class="w-full rounded-lg border p-2"
                  [(ngModel)]="modificationVersion"
                  name="version"
                  min="1"
                  required
                /><input
                  class="w-full rounded-lg border p-2"
                  [(ngModel)]="modificationId"
                  name="requestId"
                  required
                  placeholder="ID de solicitud"
                /><button class="rounded-lg bg-blue-700 px-4 py-2 text-white">
                  Aplicar campos autorizados
                </button>
              </form>
            }
          </article>
        }
      </div>
    }
    @if (canAuthorize()) {
      <section class="rounded-xl border bg-white">
        <div class="flex items-center justify-between border-b p-4">
          <h2 class="font-bold">Autorizaciones de modificación</h2>
          <button class="rounded-lg border px-3 py-1" (click)="loadModifications()">
            Actualizar
          </button>
        </div>
        @if (!modifications().length) {
          <p class="p-6 text-gray-500">No hay solicitudes pendientes.</p>
        }
        @for (item of modifications(); track item.id) {
          <div class="border-t p-4">
            <p>
              <strong>{{ item.id }}</strong> · {{ item.requested_fields.join(', ') }}
            </p>
            <p>{{ item.reason }}</p>
            <textarea
              class="my-2 w-full rounded-lg border p-2"
              [(ngModel)]="decisionReason"
              name="decisionReason"
              placeholder="Motivo obligatorio"
            ></textarea>
            <div class="flex gap-2">
              <button
                class="rounded-lg bg-blue-700 px-3 py-2 text-white"
                (click)="decide(item, 'AUTHORIZE')"
              >
                Autorizar</button
              ><button
                class="rounded-lg border border-red-300 px-3 py-2 text-red-700"
                (click)="decide(item, 'REJECT')"
              >
                Rechazar
              </button>
            </div>
            @if (issuedToken() && decidedId() === item.id) {
              <p class="mt-3 rounded-lg bg-amber-50 p-3">
                <strong>Token de un solo uso:</strong> {{ issuedToken() }} · vence
                {{ tokenExpires() | date: 'mediumTime' }}
              </p>
            }
          </div>
        }
      </section>
    }
  </section>`,
})
export class CajaFeriadoPageComponent {
  private readonly api = inject(CajaValesApiService);
  private readonly session = inject(SessionStore);
  readonly results = signal<CashVoucher[]>([]);
  readonly selected = signal<CashVoucher | null>(null);
  readonly modifications = signal<ModificationRequest[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly errorCode = signal('');
  readonly showCorrection = signal(false);
  readonly issuedToken = signal('');
  readonly tokenExpires = signal('');
  readonly decidedId = signal('');
  search = '';
  transaction = '';
  correctionReason = '';
  token = '';
  changesJson = '{}';
  modificationId = '';
  modificationVersion = 1;
  decisionReason = '';
  confirmed = false;
  correctCurp = false;
  correctAddress = false;
  constructor() {
    if (this.canAuthorize()) this.loadModifications();
  }
  canCash(): boolean {
    return this.session.permissions().includes('vouchers.cash_branch');
  }
  canAuthorize(): boolean {
    return this.session
      .permissions()
      .some((p) =>
        [
          'voucher_modifications.authorize_branch',
          'voucher_modifications.authorize_global',
        ].includes(p),
      );
  }
  searchVouchers(): void {
    if (this.search.length < 2) return;
    this.api
      .search(this.search)
      .subscribe({ next: (v) => this.results.set(v), error: (e) => this.handle(e) });
  }
  open(id: string): void {
    this.api
      .detail(id)
      .subscribe({ next: (v) => this.selected.set(v), error: (e) => this.handle(e) });
  }
  release(v: CashVoucher): void {
    this.run(this.api.release(v.id, v.lock_version));
  }
  cash(v: CashVoucher): void {
    if (!this.confirmed || !this.transaction) return;
    this.run(this.api.cash(v.id, this.transaction, v.lock_version));
  }
  requestCorrection(v: CashVoucher): void {
    const fields: Array<'curp' | 'address'> = [];
    if (this.correctCurp) fields.push('curp');
    if (this.correctAddress) fields.push('address');
    if (!fields.length || !this.correctionReason) return;
    this.api.requestModification(v.id, fields, this.correctionReason).subscribe({
      next: (r) => {
        this.modificationId = r.id;
        this.modificationVersion = r.lock_version;
        this.open(v.id);
        this.showCorrection.set(false);
      },
      error: (e) => this.handle(e),
    });
  }
  applyCorrection(): void {
    let changes: Record<string, unknown>;
    try {
      changes = JSON.parse(this.changesJson);
    } catch {
      this.errorCode.set('INVALID_JSON');
      this.error.set('Los cambios no son JSON válido.');
      return;
    }
    this.api.apply(this.modificationId, this.token, changes, this.modificationVersion).subscribe({
      next: () => {
        const v = this.selected();
        if (v) this.open(v.id);
      },
      error: (e) => this.handle(e),
    });
  }
  loadModifications(): void {
    this.api
      .listModifications()
      .subscribe({ next: (v) => this.modifications.set(v), error: (e) => this.handle(e) });
  }
  decide(item: ModificationRequest, decision: 'AUTHORIZE' | 'REJECT'): void {
    if (!this.decisionReason) return;
    this.api.decide(item.id, decision, this.decisionReason, item.lock_version).subscribe({
      next: (v) => {
        this.issuedToken.set(v.token ?? '');
        this.tokenExpires.set(v.expires_at ?? '');
        this.decidedId.set(item.id);
        this.loadModifications();
      },
      error: (e) => this.handle(e),
    });
  }
  private run(request: ReturnType<CajaValesApiService['release']>): void {
    this.busy.set(true);
    this.clear();
    request
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({ next: (v) => this.selected.set(v), error: (e) => this.handle(e) });
  }
  private clear(): void {
    this.error.set('');
    this.errorCode.set('');
  }
  private handle(e: HttpErrorResponse): void {
    this.errorCode.set(e.error?.error?.code ?? 'CASHIER_REQUEST_FAILED');
    this.error.set(e.error?.error?.message ?? 'No fue posible completar la operación.');
  }
}
