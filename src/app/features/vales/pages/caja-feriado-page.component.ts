import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionStore } from '../../../core/session/session.store';
import { MediaApiService } from '../../../core/services/media-api.service';
import { AttachmentPreviewComponent } from '../../../shared/ui/attachment-preview/attachment-preview.component';
import { StrictNumberInputDirective } from '../../../shared/directives/strict-number-input.directive';
import {
  CajaValesApiService,
  CashVoucher,
  ModificationRequest,
} from '../data-access/caja-vales-api.service';

interface DocumentPreview {
  url: string;
  mimeType: string;
  fileName: string;
}

@Component({
  selector: 'app-caja-feriado-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AttachmentPreviewComponent, StrictNumberInputDirective],
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
            <form class="rounded-xl border bg-white p-4" (submit)="$event.preventDefault()">
              <label class="block text-sm"
                >Folio o nombre<input
                  class="mt-1 w-full rounded-lg border p-2"
                  [(ngModel)]="search"
                  (ngModelChange)="searchVouchers()"
                  name="search"
                  minlength="2"
                  autocomplete="off"
                  placeholder="Escribe para buscar..."
                  required /></label>
            </form>
          @for (voucher of results(); track voucher.id) {
            <button
              class="block w-full rounded-xl border bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              (click)="open(voucher.id)"
            >
              <span class="flex items-center justify-between gap-3"><strong>{{ voucher.folio }}</strong><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{{ cashStatusLabel(voucher.status) }}</span></span>
              <span class="mt-1 block text-sm text-gray-600">{{ voucher.client?.full_name }}</span>
            </button>
          }
        </div>
        @if (selected(); as voucher) {
          <article class="rounded-xl border bg-white overflow-hidden shadow-sm">
              <header class="bg-blue-50 border-b border-blue-100 p-5 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">{{ voucher.folio }}</h2>
                  <p class="text-sm font-medium text-gray-600">{{ voucher.client?.full_name }} &middot; {{ voucher.type }} &middot; <span class="text-blue-700">{{ cashStatusLabel(voucher.status) }}</span></p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">{{ voucher.capital | currency: 'MXN' }}</p>
                  <p class="text-sm text-gray-600">Vale {{ voucher.product?.name }}</p>
                </div>
              </header>
              
              <div class="p-5 grid gap-6 md:grid-cols-2">
                <!-- Identidad -->
                <section class="space-y-2">
                  <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">Identidad oficial de la distribuidora</h3>
                  <div class="rounded-lg bg-gray-50 p-4 border border-gray-100 h-full flex flex-col gap-3">
                    <p class="font-medium text-lg">{{ voucher.distributor?.full_name }}</p>
                    @if (voucher.identity?.official_id_type) {
                      <p class="text-sm text-gray-700">
                        Id: {{ voucher.identity?.official_id_type }} 
                        @if (voucher.identity?.official_id_number) { &middot; <span class="font-mono bg-white px-2 py-1 border rounded">{{ voucher.identity?.official_id_number }}</span> }
                      </p>
                    }
                    @if (voucher.identity?.official_id_media_id) {
                      @if (identityPreview()) {
                        <app-attachment-preview [url]="identityPreview()!.url" [fileName]="identityPreview()!.fileName" [mimeType]="identityPreview()!.mimeType" />
                      } @else {
                        <p class="text-sm text-gray-600" aria-live="polite">Cargando identificación…</p>
                      }
                    } @else {
                      <p class="text-sm text-amber-700" role="alert">No hay una identificación adjunta para esta distribuidora.</p>
                    }
                  </div>
                </section>
                
                <!-- Domicilio -->
                <section class="space-y-2">
                  <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">Comprobante de domicilio de la distribuidora</h3>
                  <div class="rounded-lg bg-gray-50 p-4 border border-gray-100 h-full flex flex-col gap-3">
                    @if (voucher.address?.['street']) {
                      <p class="text-sm text-gray-800">
                        {{ voucher.address?.['street'] }} {{ voucher.address?.['exterior_number'] }}
                        @if (voucher.address?.['interior_number']) { Int {{ voucher.address?.['interior_number'] }} }
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ voucher.address?.['neighborhood'] }}, {{ voucher.address?.['postal_code'] }}
                      </p>
                    }
                    @if (voucher.address?.['address_proof_media_id']) {
                      @if (addressProofPreview()) {
                        <app-attachment-preview [url]="addressProofPreview()!.url" [fileName]="addressProofPreview()!.fileName" [mimeType]="addressProofPreview()!.mimeType" />
                      } @else {
                        <p class="text-sm text-gray-600" aria-live="polite">Cargando comprobante…</p>
                      }
                    } @else {
                      <p class="text-sm text-amber-700" role="alert">Debes adjuntar el comprobante de domicilio de la distribuidora antes de liberar el vale.</p>
                    }
                  </div>
                </section>
                
                <!-- Finanzas -->
                <section class="space-y-2 md:col-span-2">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div>
                      <p class="text-xs text-blue-800 font-semibold mb-1">Total a pagar</p>
                      <p class="font-mono text-lg">{{ voucher.client_total | currency: 'MXN' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-blue-800 font-semibold mb-1">Pagos quincenales</p>
                      <p class="font-mono text-lg">{{ voucher.client_payment_per_fortnight | currency: 'MXN' }} <span class="text-sm font-sans text-blue-600">x{{ voucher.fortnights_count }}</span></p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-xs text-blue-800 font-semibold mb-1">Cuenta bancaria de la distribuidora para dep&oacute;sito</p>
                      @if (voucher.bank_account && voucher.bank_account.bank_name !== 'N/A') {
                        <div class="flex items-center gap-3">
                          <p class="text-sm font-medium">{{ voucher.bank_account.bank_name }}</p>
                          <p class="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-200">{{ voucher.bank_account.clabe_masked }}</p>
                          @if (voucher.status === 'GENERATED' && !useAnotherBankAccount) {
                            <button type="button" class="text-sm font-medium text-blue-700 underline" (click)="useAnotherBankAccount = true">Usar otra cuenta</button>
                          }
                        </div>
                      } @else {
                        <p class="text-sm text-blue-600/70 italic">Se registrar&aacute; al liberar el vale.</p>
                      }
                    </div>
                  </div>
                </section>
              </div>

              <!-- Actions Area -->
              <div class="bg-gray-50 border-t p-5 space-y-4">
@if (voucher.status === 'GENERATED') {
                @if (requiresBankAccount(voucher) || useAnotherBankAccount) {
                  <div class="space-y-3 rounded-lg bg-emerald-50 p-4 mb-4 border border-emerald-100">
                    <p class="font-semibold text-emerald-800">{{ voucher.bank_account ? 'Registrar otra cuenta bancaria' : 'Primera vez: alta de cuenta bancaria' }}</p>
                    <p class="text-sm text-emerald-700">La cuenta se guarda para esta distribuidora y se reutiliza en sus siguientes vales.</p>
                    
                    <div class="space-y-2">
                      <select [(ngModel)]="bankName" class="w-full rounded-lg border p-2" required>
                        <option value="">Selecciona un banco</option>
                        <option value="BBVA">BBVA</option>
                        <option value="Banamex">Banamex</option>
                        <option value="Banorte">Banorte</option>
                        <option value="Santander">Santander</option>
                        <option value="HSBC">HSBC</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="Inbursa">Inbursa</option>
                        <option value="Banco Azteca">Banco Azteca</option>
                        <option value="BanCoppel">BanCoppel</option>
                      </select>
                      
                      <input type="text" [(ngModel)]="clabe" class="w-full rounded-lg border p-2" placeholder="CLABE (18 dígitos)" maxlength="18" required />
                      
                      <input type="text" [(ngModel)]="clabeConfirm" class="w-full rounded-lg border p-2" placeholder="Confirmar CLABE (18 dígitos)" maxlength="18" required />
                      @if (clabeConfirm && clabe !== clabeConfirm) {
                        <p class="text-sm font-medium text-red-700" role="alert">Las CLABE no coinciden.</p>
                      }
                      @if (voucher.bank_account) {
                        <button type="button" class="text-sm font-medium text-emerald-800 underline" (click)="cancelAnotherBankAccount()">Conservar cuenta vigente</button>
                      }
                    </div>
                  </div>
                }
                @if (!hasAddressProof(voucher)) {
                  <div class="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p class="font-semibold text-amber-900">Comprobante de domicilio requerido</p>
                    <p class="text-sm text-amber-800">Adjunta una imagen o PDF de la distribuidora antes de liberar el vale.</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="Comprobante de domicilio de la distribuidora" class="block w-full text-sm" [disabled]="uploadingAddressProof() || !voucher.document_owner" (change)="uploadAddressProof(voucher, $event)" />
                    @if (uploadingAddressProof()) { <p class="text-sm text-amber-800">Cargando comprobante…</p> }
                  </div>
                }
                <div class="flex flex-wrap gap-2">
                  <button
                    class="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
                    [disabled]="busy() || uploadingAddressProof() || !hasAddressProof(voucher) || ((requiresBankAccount(voucher) || useAnotherBankAccount) && (!bankName || clabe !== clabeConfirm || clabe.length !== 18))"
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
                  appStrictNumber type="number"
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
          </div>
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
export class CajaFeriadoPageComponent implements OnDestroy {
  private readonly api = inject(CajaValesApiService);
  private readonly media = inject(MediaApiService);
  private readonly session = inject(SessionStore);
  readonly results = signal<CashVoucher[]>([]);
  readonly selected = signal<CashVoucher | null>(null);
  readonly modifications = signal<ModificationRequest[]>([]);
  readonly busy = signal(false);
  readonly uploadingAddressProof = signal(false);
  readonly identityPreview = signal<DocumentPreview | null>(null);
  readonly addressProofPreview = signal<DocumentPreview | null>(null);
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
  bankName = '';
  clabe = '';
  clabeConfirm = '';
  useAnotherBankAccount = false;
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
    this.bankName = '';
    this.clabe = '';
    this.clabeConfirm = '';
    this.useAnotherBankAccount = false;
    this.api
      .detail(id)
      .subscribe({ next: (v) => this.setSelected(v), error: (e) => this.handle(e) });
  }
  cashStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      GENERATED: 'Generado · pendiente de caja',
      RELEASED: 'Liberado · pendiente de cobro',
      CASHED: 'Cobrado',
      CANCELLED: 'Cancelado',
      VOIDED: 'Anulado',
    };

    return labels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('es-MX');
  }
  hasAddressProof(voucher: CashVoucher): boolean {
    return !!voucher.address?.['address_proof_media_id'];
  }
  uploadAddressProof(voucher: CashVoucher, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const applicationId = voucher.document_owner?.owner_id;
    if (!file || !applicationId || this.uploadingAddressProof()) return;

    this.clear();
    this.uploadingAddressProof.set(true);
    this.api.uploadAddressProof(applicationId, file)
      .pipe(finalize(() => this.uploadingAddressProof.set(false)))
      .subscribe({
        next: () => this.api.detail(voucher.id).subscribe({ next: (updated) => this.setSelected(updated), error: (error) => this.handle(error) }),
        error: (error) => this.handle(error),
      });
  }
  release(v: CashVoucher): void {
    if (this.requiresBankAccount(v) || this.useAnotherBankAccount) {
      if (!this.bankName || this.clabe !== this.clabeConfirm || this.clabe.length !== 18) {
        this.error.set('Por favor, ingresa un banco válido y asegúrate de que la CLABE tenga 18 dígitos y coincida.');
        return;
      }
      this.run(this.api.release(v.id, v.lock_version, this.bankName, this.clabe));
    } else {
      this.run(this.api.release(v.id, v.lock_version));
    }
  }

  requiresBankAccount(voucher: CashVoucher): boolean {
    return !voucher.bank_account || voucher.bank_account.bank_name === 'N/A';
  }

  cancelAnotherBankAccount(): void {
    this.useAnotherBankAccount = false;
    this.bankName = '';
    this.clabe = '';
    this.clabeConfirm = '';
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
      .subscribe({ next: (v) => this.setSelected(v), error: (e) => this.handle(e) });
  }

  ngOnDestroy(): void {
    this.clearPreviews();
  }

  private setSelected(voucher: CashVoucher): void {
    this.selected.set(voucher);
    this.loadPreview(voucher.identity?.official_id_media_id ?? null, this.identityPreview, 'Identificación oficial');
    this.loadPreview(voucher.address?.['address_proof_media_id'] ?? null, this.addressProofPreview, 'Comprobante de domicilio');
  }

  private loadPreview(
    mediaId: string | null,
    target: WritableSignal<DocumentPreview | null>,
    fileName: string,
  ): void {
    this.revokePreview(target);
    if (!mediaId) return;

    this.media.download(mediaId).subscribe({
      next: (blob) => target.set({ url: URL.createObjectURL(blob), mimeType: blob.type || 'application/octet-stream', fileName }),
      error: (error) => this.handle(error),
    });
  }

  private clearPreviews(): void {
    this.revokePreview(this.identityPreview);
    this.revokePreview(this.addressProofPreview);
  }

  private revokePreview(target: WritableSignal<DocumentPreview | null>): void {
    const current = target();
    if (current) URL.revokeObjectURL(current.url);
    target.set(null);
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
