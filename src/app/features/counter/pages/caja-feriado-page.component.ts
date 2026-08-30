import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { SessionStore } from '../../../core/session/session.store';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import {
  AddressFormComponent,
  AddressResult,
} from '../../../shared/components/inputs/address-form/address-form';
import { PhoneInputComponent } from '../../../shared/components/inputs/phone-input/phone-input.component';
import { AttachmentPreviewComponent } from '../../../shared/components/media/attachment-preview/attachment-preview.component';
import { InputErrorComponent } from '../../../shared/components/inputs/input-error/input-error.component';
import { curpValidator } from '../../applications/validators/curp.validator';
import { adultBirthDateValidator } from '../../applications/validators/adult-birth-date.validator';
import { personNameValidator } from '../../applications/validators/person-name.validator';
import { phoneValidator } from '../../applications/validators/phone.validator';
import {
  CajaValesApiService,
  CashVoucher,
  ModificationChanges,
  ModificationRequest,
} from '../data-access/caja-vales-api.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { StatusBadgeComponent } from '@shared/components/badges/status-badge/status-badge.component';
import {
  PRIVATE_MEDIA_FILE_RULE,
  validateUploadFile,
} from '../../../shared/utils/files/file-validation';

interface DocumentPreview {
  url: string;
  mimeType: string;
  fileName: string;
}

interface CorrectionAddress extends Record<string, string> {
  street: string;
  exterior_number: string;
  interior_number: string;
  neighborhood: string;
  postal_code: string;
  municipality: string;
  city: string;
  state: string;
  country: string;
}

@Component({
  selector: 'app-caja-feriado-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AttachmentPreviewComponent,
    AddressFormComponent,
    PhoneInputComponent,
    InputErrorComponent,
    RefactorSelectComponent,
    StatusBadgeComponent,
  ],
  template: `<section class="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
          Operación de caja
        </p>
        <h1 class="text-2xl font-bold text-slate-950">Caja y autorizaciones</h1>
        <p class="mt-1 text-sm text-slate-600">
          MisVales registra el depósito manual; no ejecuta operaciones bancarias.
        </p>
      </div>
      <button
        type="button"
        class="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-600 hover:text-emerald-700"
        (click)="refreshPage()"
      >
        Actualizar
      </button>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <strong>{{ errorCode() }}</strong> {{ error() }}
      </div>
    }
    @if (canAuthorize()) {
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4"
        >
          <div>
            <h2 class="font-bold">Autorizaciones de corrección</h2>
            <p class="text-sm text-gray-600">
              Revisa los datos propuestos y entrega el token a la cajera solicitante.
            </p>
          </div>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5"
            (click)="loadModifications()"
          >
            Actualizar
          </button>
        </div>
        @if (issuedToken()) {
          <div class="m-4 rounded-xl border border-amber-300 bg-amber-50 p-4" role="status">
            <p class="font-semibold text-amber-950">Token para la cajera solicitante</p>
            <p class="my-2 font-mono text-3xl font-bold tracking-[0.3em] text-amber-950">
              {{ issuedToken() }}
            </p>
            <p class="text-sm text-amber-900">
              Vence a las {{ tokenExpires() | date: 'mediumTime' }} y solo puede usarse una vez.
            </p>
          </div>
        }
        @if (!modifications().length) {
          <div class="flex min-h-72 flex-col items-center justify-center p-6 text-center">
            <img src="/no-found-1.png" alt="" class="h-40 w-full max-w-xs object-contain" />
            <h3 class="font-bold text-slate-950">No hay correcciones por autorizar</h3>
            <p class="mt-1 text-sm text-slate-500">
              Las solicitudes de Caja aparecerán aquí cuando requieran una decisión.
            </p>
          </div>
        }
        @for (item of modifications(); track item.id) {
          <div class="space-y-3 border-t border-slate-200 p-4">
            <div>
              <p class="font-semibold">{{ item.vale?.folio || 'Corrección de vale' }}</p>
              <p class="text-sm text-gray-600">
                {{ correctionFieldsLabel(item.requested_fields) }}
              </p>
            </div>
            <div class="rounded-lg bg-gray-50 p-3 text-sm">
              @if (item.requested_changes?.first_name) {
                <p><span class="font-semibold">Nombre propuesto:</span> {{ item.requested_changes?.first_name }}</p>
              }
              @if (item.requested_changes?.first_last_name) {
                <p><span class="font-semibold">Apellido paterno propuesto:</span> {{ item.requested_changes?.first_last_name }}</p>
              }
              @if (item.requested_changes?.second_last_name) {
                <p><span class="font-semibold">Apellido materno propuesto:</span> {{ item.requested_changes?.second_last_name }}</p>
              }
              @if (item.requested_changes?.birth_date) {
                <p><span class="font-semibold">Fecha de nacimiento propuesta:</span> {{ item.requested_changes?.birth_date }}</p>
              }
              @if (item.requested_changes?.phone_number) {
                <p><span class="font-semibold">Teléfono propuesto:</span> {{ item.requested_changes?.phone_number }}</p>
              }
              @if (item.requested_changes?.curp) {
                <p>
                  <span class="font-semibold">CURP propuesta:</span>
                  <span class="font-mono">{{ item.requested_changes?.curp }}</span>
                </p>
              }
              @if (item.requested_changes?.address; as address) {
                <p>
                  <span class="font-semibold">Domicilio propuesto:</span>
                  {{ addressLabel(address) }}
                </p>
              }
              @if (!item.requested_changes) {
                <p class="font-medium text-amber-800">
                  Esta solicitud anterior no contiene los datos corregidos. Recházala para que Caja
                  la capture nuevamente.
                </p>
              }
              <p class="hidden"><span class="font-semibold">Motivo:</span> {{ item.reason }}</p>
            </div>
            <label class="hidden block text-sm"
              >Motivo de la decisión
              <textarea
                class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                [(ngModel)]="decisionReasons[item.id]"
                [name]="'decisionReason-' + item.id"
                maxlength="500"
                required
              ></textarea>
            </label>
            <div class="flex gap-2">
              <button
                class="rounded-lg bg-blue-700 px-3 py-2 text-white disabled:opacity-50"
                [disabled]="!item.requested_changes"
                data-manager-action
                (click)="decide(item, 'AUTHORIZE')"
              >
                Autorizar y generar token
              </button>
              <button
                class="rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-50"
                [disabled]="!item.requested_changes"
                data-manager-action
                (click)="decide(item, 'REJECT')"
              >
                Rechazar
              </button>
            </div>
          </div>
        }
      </section>
    }
    @if (canCash()) {
      <div class="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <div class="space-y-4">
          <section
            class="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"
            aria-labelledby="cash-voucher-title"
          >
            <header class="border-b border-emerald-100 bg-emerald-50/70 p-4">
              <p class="text-xs font-bold uppercase tracking-[.12em] text-emerald-700">
                Operación inmediata
              </p>
              <h2 id="cash-voucher-title" class="mt-1 text-lg font-bold text-slate-950">
                Feriar un vale
              </h2>
              <p class="mt-1 text-sm text-slate-600">
                Localiza el vale por folio, distribuidora o cliente y continúa con su validación.
              </p>
            </header>
            <form class="p-4" (submit)="$event.preventDefault()">
              <label class="block text-sm font-semibold text-slate-800"
                >Folio o nombre<input
                  class="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  [(ngModel)]="search"
                  (ngModelChange)="searchVouchers()"
                  name="search"
                  minlength="2"
                  autocomplete="off"
                  placeholder="Ej. MV-00125 o Ana López"
                  required
              /></label>
              @if (search.trim().length < 2) {
                <p class="mt-2 text-xs text-slate-500">
                  Escribe al menos dos caracteres. El histórico permanece separado.
                </p>
              }
            </form>
            @if (search.trim().length >= 2) {
              <div class="border-t border-slate-100 p-3" aria-live="polite">
                @for (voucher of displayedVouchers(); track voucher.id) {
                  <button
                    type="button"
                    class="mb-2 grid min-h-16 w-full grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-200 p-3 text-left transition last:mb-0 hover:border-emerald-300 hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    (click)="open(voucher.id)"
                  >
                    <span
                      ><strong class="block text-sm text-slate-950">{{ voucher.folio }}</strong
                      ><small class="mt-1 block text-xs text-slate-500">{{
                        voucher.client?.full_name ||
                          voucher.distributor?.full_name ||
                          'Sin nombre disponible'
                      }}</small></span
                    >
                    <span class="text-right"
                      ><app-status-badge
                        [tone]="
                          voucher.status === 'CASHED'
                            ? 'success'
                            : voucher.status === 'RELEASED'
                              ? 'info'
                              : voucher.status === 'CANCELLED' || voucher.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                        "
                        >{{ cashStatusLabel(voucher.status) }}</app-status-badge
                      ><strong class="mt-1 block text-sm text-slate-800">{{
                        voucher.capital | currency: 'MXN'
                      }}</strong></span
                    >
                  </button>
                } @empty {
                  <div class="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                    <strong class="text-sm text-slate-900">Sin coincidencias</strong>
                    <p class="mt-1 text-xs text-slate-500">Prueba con otro folio o nombre.</p>
                  </div>
                }
              </div>
            }
          </section>

          <section
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby="voucher-list-title"
          >
            <header class="border-b border-slate-200 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="voucher-list-title" class="font-bold text-slate-950">Vales en caja</h2>
                  <p class="mt-1 text-sm text-slate-500">
                    Consulta pendientes e histórico sin realizar una búsqueda.
                  </p>
                </div>
                <span
                  class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >{{ tableVouchers().length }} registros</span
                >
              </div>
              <div
                class="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
                role="tablist"
                aria-label="Listados de vales"
              >
                <button
                  type="button"
                  role="tab"
                  class="min-h-11 rounded-lg px-3 text-sm font-semibold"
                  [class.bg-white]="listView() === 'pending'"
                  [class.shadow-sm]="listView() === 'pending'"
                  [attr.aria-selected]="listView() === 'pending'"
                  (click)="changeListView('pending')"
                >
                  Pendientes
                  <span class="ml-1 text-xs text-slate-500">{{ pendingVouchers().length }}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  class="min-h-11 rounded-lg px-3 text-sm font-semibold"
                  [class.bg-white]="listView() === 'history'"
                  [class.shadow-sm]="listView() === 'history'"
                  [attr.aria-selected]="listView() === 'history'"
                  (click)="changeListView('history')"
                >
                  Histórico
                  <span class="ml-1 text-xs text-slate-500">{{ historyVouchers().length }}</span>
                </button>
              </div>
              <label class="mt-3 block text-xs font-semibold text-slate-600"
                >Filtrar esta tabla<input
                  class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  [ngModel]="listFilter()"
                  (ngModelChange)="listFilter.set($event)"
                  name="listFilter"
                  placeholder="Folio, cliente o distribuidora"
              /></label>
            </header>
            @if (listLoading()) {
              <div class="p-8 text-center text-sm text-slate-500">Cargando vales…</div>
            } @else if (tableVouchers().length) {
              <div class="overflow-x-auto">
                <table class="w-full border-collapse text-sm">
                  <thead class="bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th class="px-4 py-3 font-semibold">Folio</th>
                      <th class="px-4 py-3 font-semibold">Cliente</th>
                      <th class="px-4 py-3 font-semibold">Fecha</th>
                      <th class="px-4 py-3 text-right font-semibold">Importe</th>
                      <th class="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (voucher of tableVouchers(); track voucher.id) {
                      <tr
                        class="cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/40"
                        tabindex="0"
                        (click)="open(voucher.id)"
                        (keydown.enter)="open(voucher.id)"
                      >
                        <td class="px-4 py-3 font-semibold text-emerald-800">
                          {{ voucher.folio }}
                        </td>
                        <td class="px-4 py-3 text-slate-700">
                          {{ voucher.client?.full_name || 'Sin dato' }}
                        </td>
                        <td class="px-4 py-3 text-slate-500">
                          {{ voucher.cashed_at || voucher.generated_at | date: 'short' }}
                        </td>
                        <td class="px-4 py-3 text-right font-semibold text-slate-900">
                          {{ voucher.capital | currency: 'MXN' }}
                        </td>
                        <td class="px-4 py-3">
                          <app-status-badge
                            [tone]="
                              voucher.status === 'CASHED'
                                ? 'success'
                                : voucher.status === 'RELEASED'
                                  ? 'info'
                                  : voucher.status === 'CANCELLED' || voucher.status === 'REJECTED'
                                    ? 'danger'
                                    : 'warning'
                            "
                            >{{ cashStatusLabel(voucher.status) }}</app-status-badge
                          >
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center">
                <strong class="text-sm text-slate-900">{{
                  listFilter().trim()
                    ? 'Sin coincidencias en la tabla'
                    : listView() === 'pending'
                      ? 'No hay vales pendientes'
                      : 'No hay vales en el histórico'
                }}</strong>
                <p class="mt-1 text-xs text-slate-500">
                  {{
                    listFilter().trim()
                      ? 'Limpia el filtro o prueba otro término.'
                      : 'Los registros aparecerán conforme avance la operación.'
                  }}
                </p>
              </div>
            }
          </section>
        </div>
        @if (selected(); as voucher) {
          <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header
              class="bg-blue-50 border-b border-blue-100 p-5 flex flex-wrap justify-between items-center gap-4"
            >
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ voucher.folio }}</h2>
                <p class="text-sm font-medium text-gray-600">
                  {{ voucher.client?.full_name }} &middot; {{ voucher.type }} &middot;
                  <span class="text-blue-700">{{ cashStatusLabel(voucher.status) }}</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">
                  {{ voucher.capital | currency: 'MXN' }}
                </p>
                <p class="text-sm text-gray-600">Vale {{ voucher.product?.name }}</p>
              </div>
            </header>

            <div class="p-5 grid gap-6 md:grid-cols-2">
              <!-- Identidad -->
              <section class="space-y-2">
                <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Identidad oficial del cliente
                </h3>
                <div
                  class="rounded-lg bg-gray-50 p-4 border border-gray-100 h-full flex flex-col gap-3"
                >
                  <p class="font-medium text-lg">{{ voucher.client?.full_name }}</p>
                  @if (voucher.identity?.official_id_type) {
                    <p class="text-sm text-gray-700">
                      Id: {{ voucher.identity?.official_id_type }}
                      @if (voucher.identity?.official_id_number) {
                        &middot;
                        <span
                          class="rounded border border-slate-200 bg-white px-2 py-1 font-mono"
                          >{{ voucher.identity?.official_id_number }}</span
                        >
                      }
                    </p>
                  }
                  @if (voucher.identity?.official_id_media_id) {
                    @if (identityPreview()) {
                      <app-attachment-preview
                        [url]="identityPreview()!.url"
                        [fileName]="identityPreview()!.fileName"
                        [mimeType]="identityPreview()!.mimeType"
                      />
                    } @else {
                      <p class="text-sm text-gray-600" aria-live="polite">
                        Cargando identificación…
                      </p>
                    }
                  } @else {
                    <p class="text-sm text-amber-700" role="alert">
                      No hay una identificación adjunta para esta distribuidora.
                    </p>
                  }
                </div>
              </section>

              <!-- Domicilio -->
              <section class="space-y-2">
                <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Comprobante de domicilio del cliente
                </h3>
                <div
                  class="rounded-lg bg-gray-50 p-4 border border-gray-100 h-full flex flex-col gap-3"
                >
                  @if (voucher.address?.['street']) {
                    <p class="text-sm text-gray-800">
                      {{ voucher.address?.['street'] }} {{ voucher.address?.['exterior_number'] }}
                      @if (voucher.address?.['interior_number']) {
                        Int {{ voucher.address?.['interior_number'] }}
                      }
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ voucher.address?.['neighborhood'] }},
                      {{ voucher.address?.['postal_code'] }}
                    </p>
                  }
                  @if (voucher.address?.['address_proof_media_id']) {
                    @if (addressProofPreview()) {
                      <app-attachment-preview
                        [url]="addressProofPreview()!.url"
                        [fileName]="addressProofPreview()!.fileName"
                        [mimeType]="addressProofPreview()!.mimeType"
                      />
                    } @else {
                      <p class="text-sm text-gray-600" aria-live="polite">Cargando comprobante…</p>
                    }
                  } @else {
                    <p class="text-sm text-amber-700" role="alert">
                      Debes adjuntar el comprobante de domicilio de la distribuidora antes de
                      liberar el vale.
                    </p>
                  }
                </div>
              </section>

              <!-- Finanzas -->
              <section class="space-y-2 md:col-span-2">
                <div
                  class="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg bg-blue-50 p-4 border border-blue-100"
                >
                  <div>
                    <p class="text-xs text-blue-800 font-semibold mb-1">Total a pagar</p>
                    <p class="font-mono text-lg">{{ voucher.client_total | currency: 'MXN' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-800 font-semibold mb-1">Pagos quincenales</p>
                    <p class="font-mono text-lg">
                      {{ voucher.client_payment_per_fortnight | currency: 'MXN' }}
                      <span class="text-sm font-sans text-blue-600"
                        >x{{ voucher.fortnights_count }}</span
                      >
                    </p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-xs text-blue-800 font-semibold mb-1">
                      Cuenta bancaria del cliente para dep&oacute;sito
                    </p>
                    @if (voucher.bank_account?.clabe_masked) {
                      <div class="flex items-center gap-3">
                        <p class="text-sm font-medium">
                          {{ voucher.bank_account?.bank_name || 'Banco no especificado' }}
                        </p>
                        <p
                          class="font-mono text-sm bg-white px-2 py-1 rounded border border-blue-200"
                        >
                          {{ voucher.bank_account.clabe_masked }}
                        </p>
                      </div>
                    } @else {
                      <p class="text-sm text-blue-600/70 italic">
                        Se registrar&aacute; al liberar el vale.
                      </p>
                    }
                  </div>
                </div>
              </section>
            </div>

            <!-- Actions Area -->
            <div class="space-y-4 border-t border-slate-200 bg-gray-50 p-5">
              @if (voucher.status === 'GENERATED') {
                @if (false && (requiresBankAccount(voucher) || useAnotherBankAccount)) {
                  <div
                    class="space-y-3 rounded-lg bg-emerald-50 p-4 mb-4 border border-emerald-100"
                  >
                    <p class="font-semibold text-emerald-800">
                      {{
                        voucher.bank_account
                          ? 'Registrar otra cuenta bancaria'
                          : 'Primera vez: alta de cuenta bancaria'
                      }}
                    </p>
                    <p class="text-sm text-emerald-700">
                      La cuenta se guarda para esta distribuidora y se reutiliza en sus siguientes
                      vales.
                    </p>

                    <div class="space-y-2">
                      <refactor-select
                        [(ngModel)]="bankName"
                        class="w-full rounded-lg border border-slate-200 p-2"
                        required
                      >
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
                      </refactor-select>

                      <input
                        type="text"
                        [(ngModel)]="clabe"
                        class="w-full rounded-lg border border-slate-200 p-2"
                        placeholder="CLABE (18 dígitos)"
                        maxlength="18"
                        required
                      />

                      <input
                        type="text"
                        [(ngModel)]="clabeConfirm"
                        class="w-full rounded-lg border border-slate-200 p-2"
                        placeholder="Confirmar CLABE (18 dígitos)"
                        maxlength="18"
                        required
                      />
                      @if (clabeConfirm && clabe !== clabeConfirm) {
                        <p class="text-sm font-medium text-red-700" role="alert">
                          Las CLABE no coinciden.
                        </p>
                      }
                      @if (voucher.bank_account) {
                        <button
                          type="button"
                          class="text-sm font-medium text-emerald-800 underline"
                          (click)="cancelAnotherBankAccount()"
                        >
                          Conservar cuenta vigente
                        </button>
                      }
                    </div>
                  </div>
                }
                @if (false && !hasAddressProof(voucher)) {
                  <div class="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p class="font-semibold text-amber-900">Comprobante de domicilio requerido</p>
                    <p class="text-sm text-amber-800">
                      Adjunta una imagen o PDF de la distribuidora antes de liberar el vale.
                    </p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.jfif,.png,.webp,.gif,.bmp,.tif,.tiff,.heic,.heif,.avif,application/pdf"
                      aria-label="Comprobante de domicilio de la distribuidora"
                      class="block w-full text-sm"
                      [disabled]="uploadingAddressProof() || !voucher.document_owner"
                      (change)="uploadAddressProof(voucher, $event)"
                    />
                    @if (uploadingAddressProof()) {
                      <p class="text-sm text-amber-800">Cargando comprobante…</p>
                    }
                  </div>
                }
                <div class="flex flex-wrap gap-2">
                  <button
                    class="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
                    [disabled]="busy()"
                    (click)="release(voucher)"
                  >
                    Identidad coincide: liberar</button
                  ><button
                    class="rounded-lg border border-slate-200 px-4 py-2"
                    (click)="showCorrection.set(true)"
                  >
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
                  >
                  <div class="grid gap-2 sm:grid-cols-2">
                    <label
                      ><input type="checkbox" [(ngModel)]="correctFirstName" name="firstName" />
                      Nombre</label
                    ><label
                      ><input
                        type="checkbox"
                        [(ngModel)]="correctFirstLastName"
                        name="firstLastName"
                      />
                      Apellido paterno</label
                    ><label
                      ><input
                        type="checkbox"
                        [(ngModel)]="correctSecondLastName"
                        name="secondLastName"
                      />
                      Apellido materno</label
                    ><label
                      ><input type="checkbox" [(ngModel)]="correctBirthDate" name="birthDate" />
                      Fecha de nacimiento</label
                    ><label
                      ><input
                        type="checkbox"
                        [(ngModel)]="correctPhoneNumber"
                        name="phoneNumber"
                      />
                      Teléfono</label
                  >
                  </div>
                  @if (correctFirstName) {
                    <label class="block text-sm"
                      >Nombre corregido<input
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [formControl]="correctionFirstNameControl"
                      /> </label
                    >
                  }
                  @if (correctFirstLastName) {
                    <label class="block text-sm"
                      >Apellido paterno corregido<input
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [formControl]="correctionFirstLastNameControl"
                      /> </label
                    >
                  }
                  @if (correctSecondLastName) {
                    <label class="block text-sm"
                      >Apellido materno corregido<input
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [formControl]="correctionSecondLastNameControl"
                      /> </label
                    >
                  }
                  @if (correctBirthDate) {
                    <label class="block text-sm"
                      >Fecha de nacimiento corregida<input
                        type="date"
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [formControl]="correctionBirthDateControl"
                      /> </label
                    >
                  }
                  @if (correctPhoneNumber) {
                    <label class="block text-sm"
                      >Teléfono corregido<app-phone-input
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [formControl]="correctionPhoneNumberControl"
                      ></app-phone-input> </label
                    >
                  }
                  @if (correctCurp) {
                    <label class="block text-sm"
                      >CURP corregida
                      <input
                        #correctionCurpInput
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2 font-mono uppercase"
                        [formControl]="correctionCurpControl"
                        maxlength="18"
                        autocomplete="off"
                        (blur)="normalizeCorrectionCurp()"
                        [class.border-red-500]="
                          correctionCurpControl.invalid && correctionCurpControl.touched
                        "
                        [class.ring-1]="
                          correctionCurpControl.invalid && correctionCurpControl.touched
                        "
                        [class.ring-red-500]="
                          correctionCurpControl.invalid && correctionCurpControl.touched
                        "
                        [attr.aria-invalid]="
                          correctionCurpControl.invalid && correctionCurpControl.touched
                        "
                      />
                    </label>
                    <app-input-error
                      [control]="correctionCurpControl"
                      label="La CURP"
                      [customMessages]="{
                        required: 'La CURP es obligatoria.',
                        maxlength: 'La CURP debe tener exactamente 18 caracteres.',
                        pattern: 'La CURP solo puede contener letras y números.',
                        invalidCurp: 'La CURP debe tener exactamente 18 caracteres alfanuméricos.',
                      }"
                    ></app-input-error>
                  }
                  @if (correctAddress) {
                    <fieldset class="rounded-lg border border-slate-200 bg-white p-3">
                      <legend class="px-1 text-sm font-semibold">Domicilio corregido</legend>
                      <app-address-form
                        [showValidationState]="true"
                        [enableStreetAutocomplete]="false"
                        (addressChange)="onCorrectionAddressChange($event)"
                      />
                    </fieldset>
                  }
                  <label class="hidden block text-sm"
                    >Motivo de la corrección
                    <textarea
                      #correctionReasonInput
                      #correctionReasonModel="ngModel"
                      class="mt-1 block w-full rounded-lg border border-slate-200 p-2"
                      [(ngModel)]="correctionReason"
                      name="reason"
                      maxlength="500"
                      placeholder="Explica por qué debe corregirse"
                      [class.border-red-500]="
                        correctionReasonModel.invalid && correctionReasonModel.touched
                      "
                      [class.ring-1]="
                        correctionReasonModel.invalid && correctionReasonModel.touched
                      "
                      [class.ring-red-500]="
                        correctionReasonModel.invalid && correctionReasonModel.touched
                      "
                    ></textarea>
                  </label>
                  <app-input-error
                    [control]="correctionReasonModel.control"
                    label="El motivo"
                  ></app-input-error>
                  <button class="rounded-lg bg-blue-700 px-4 py-2 text-white" [disabled]="busy()">
                    Enviar solicitud
                  </button>
                </form>
              }
              @if (voucher.status === 'RELEASED') {
                <form class="space-y-3 rounded-lg bg-emerald-50 p-4" (ngSubmit)="cash(voucher)">
                  <label class="block text-sm"
                    >Forma de pago<select
                      class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                      [(ngModel)]="paymentMethod"
                      name="paymentMethod"
                    >
                      <option value="CASH">Efectivo</option>
                      <option value="TRANSFER">Transferencia</option>
                    </select></label
                  >
                  @if (paymentMethod === 'TRANSFER') {
                    <label class="block text-sm"
                      >CLABE del cliente<input
                        class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                        [(ngModel)]="paymentClabe"
                        name="paymentClabe"
                        inputmode="numeric"
                        maxlength="18"
                        autocomplete="off"
                        placeholder="18 dÃ­gitos"
                      /> </label
                    >
                  <label class="block text-sm"
                    >Número de transacción del depósito manual<input
                      #transactionInput
                      class="mt-1 w-full rounded-lg border border-slate-200 p-2"
                      [formControl]="transactionControl"
                      inputmode="numeric"
                      maxlength="25"
                      autocomplete="off"
                      (keydown)="allowOnlyTransactionDigits($event)"
                      (input)="sanitizeTransactionNumber($event)"
                      [class.border-red-500]="
                        transactionControl.invalid && transactionControl.touched
                      "
                      [class.ring-1]="transactionControl.invalid && transactionControl.touched"
                      [class.ring-red-500]="
                        transactionControl.invalid && transactionControl.touched
                      "
                      [attr.aria-invalid]="
                        transactionControl.invalid && transactionControl.touched
                      "
                  /></label>
                  <app-input-erro
                    [control]="transactionControl"
                    label="El número de transacción"
                    [customMessages]="{
                      required: 'El número de transacción es obligatorio.',
                      maxlength: 'El número de transacción no debe exceder 25 dígitos.',
                      pattern: 'El número de transacción solo puede contener números.',
                    }"
                  ></app-input-error>
                  }
                  <label [class.hidden]="paymentMethod === 'CASH'"
                    ><input type="checkbox" [(ngModel)]="confirmed" name="confirmed" required />
                    Confirmo que el depósito se realizó fuera de MisVales</label
                  ><button
                    class="block rounded-lg bg-emerald-700 px-4 py-2 text-white"
                    [disabled]="busy() || (paymentMethod === 'TRANSFER' && !confirmed)"
                  >
                    Feriar vale
                  </button>
                </form>
              }
              @if (voucher.status === 'CORRECTION_PENDING' && voucher.modification_request) {
                <form
                  class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                  (ngSubmit)="applyCorrection()"
                >
                  <p class="font-semibold text-amber-950">Aplicar corrección autorizada</p>
                  <p class="text-sm text-amber-900">
                    Introduce el token de 8 caracteres que te entregó Gerencia. Vence en 5 minutos y
                    es de un solo uso.
                  </p>
                  <input
                    class="w-full rounded-lg border border-slate-200 p-3 font-mono text-xl uppercase tracking-[0.3em]"
                    [(ngModel)]="token"
                    name="token"
                    minlength="8"
                    maxlength="8"
                    autocomplete="one-time-code"
                    required
                    placeholder="XXXXXXXX"
                  /><button
                    class="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
                    [disabled]="busy() || token.trim().length !== 8 || !modificationId"
                  >
                    Aplicar campos autorizados
                  </button>
                </form>
              }
              @if (voucher.status === 'CORRECTION_PENDING' && !voucher.modification_request) {
                <div
                  class="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4"
                  role="status"
                >
                  <p class="font-semibold text-amber-950">
                    La solicitud de corrección ya no está activa.
                  </p>
                  <p class="text-sm text-amber-900">
                    Actualiza el vale para continuar o capturar una nueva solicitud.
                  </p>
                  <button
                    type="button"
                    class="rounded-lg border border-amber-400 bg-white px-4 py-2 text-amber-950"
                    (click)="open(voucher.id)"
                  >
                    Actualizar vale
                  </button>
                </div>
              }
              @if (voucher.status === 'CASHED') {
                <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4" role="status">
                  <p class="font-semibold text-emerald-950">Vale cobrado</p>
                  <p class="mt-1 text-sm text-emerald-800">
                    El depósito manual ya fue registrado. Este vale no tiene acciones pendientes en
                    Caja.
                  </p>
                </div>
              }
            </div>
          </article>
        }
      </div>
    }
  </section>`,
})
export class CajaFeriadoPageComponent implements OnDestroy {
  private readonly api = inject(CajaValesApiService);
  private readonly media = inject(MediaApiService);
  private readonly session = inject(SessionStore);
  readonly results = signal<CashVoucher[]>([]);
  readonly pendingVouchers = signal<CashVoucher[]>([]);
  readonly historyVouchers = signal<CashVoucher[]>([]);
  readonly listView = signal<'pending' | 'history'>('pending');
  readonly listFilter = signal('');
  readonly listLoading = signal(false);
  readonly displayedVouchers = computed(() => this.results());
  readonly tableVouchers = computed(() => {
    const source = this.listView() === 'pending' ? this.pendingVouchers() : this.historyVouchers();
    const term = this.listFilter().trim().toLocaleLowerCase('es-MX');
    if (!term) return source;
    return source.filter((voucher) =>
      [
        voucher.folio,
        voucher.client?.full_name,
        voucher.distributor?.full_name,
        voucher.distributor?.distributor_number,
      ].some((value) => value?.toLocaleLowerCase('es-MX').includes(term)),
    );
  });
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
  search = '';
  readonly transactionControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(25), Validators.pattern(/^\d+$/)],
  });
  correctionReason = '';
  correctionFirstName = '';
  correctionFirstLastName = '';
  correctionSecondLastName = '';
  correctionBirthDate = '';
  correctionPhoneNumber = '';
  readonly correctionFirstNameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120), personNameValidator],
  });
  readonly correctionFirstLastNameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120), personNameValidator],
  });
  readonly correctionSecondLastNameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120), personNameValidator],
  });
  readonly correctionBirthDateControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, adultBirthDateValidator],
  });
  readonly correctionPhoneNumberControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, phoneValidator()],
  });
  readonly correctionCurpControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(18),
      Validators.pattern(/^[A-Z\d]{18}$/i),
      curpValidator(),
    ],
  });
  correctionAddress: CorrectionAddress = {
    street: '',
    exterior_number: '',
    interior_number: '',
    neighborhood: '',
    postal_code: '',
    municipality: '',
    city: '',
    state: '',
    country: 'MX',
  };
  token = '';
  modificationId = '';
  modificationVersion = 1;
  decisionReasons: Record<string, string> = {};
  confirmed = false;
  paymentMethod: 'CASH' | 'TRANSFER' = 'TRANSFER';
  paymentClabe = '';
  correctFirstName = false;
  correctFirstLastName = false;
  correctSecondLastName = false;
  correctBirthDate = false;
  correctPhoneNumber = false;
  correctCurp = false;
  correctAddress = false;
  bankName = '';
  clabe = '';
  clabeConfirm = '';
  useAnotherBankAccount = false;
  private searchGeneration = 0;
  @ViewChild('correctionCurpInput') private correctionCurpInput?: ElementRef<HTMLInputElement>;
  @ViewChild(AddressFormComponent) private correctionAddressForm?: AddressFormComponent;
  @ViewChild('correctionReasonInput')
  private correctionReasonInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('correctionReasonModel') private correctionReasonModel?: NgModel;
  @ViewChild('transactionInput') private transactionInput?: ElementRef<HTMLInputElement>;
  constructor() {
    if (this.canAuthorize()) this.loadModifications();
    if (this.canCash()) this.loadVoucherLists();
  }
  canCash(): boolean {
    return this.session.permissions().includes('vouchers.cash_branch');
  }
  canAuthorize(): boolean {
    const roles = this.session.roles();
    const isManager = roles.includes('general_manager') || roles.includes('branch_manager');
    return (
      isManager &&
      this.session
        .permissions()
        .some((p) =>
          [
            'voucher_modifications.authorize_branch',
            'voucher_modifications.authorize_global',
          ].includes(p),
        )
    );
  }
  searchVouchers(): void {
    const term = this.search.trim();
    const generation = ++this.searchGeneration;
    if (term.length < 2) {
      this.results.set([]);
      this.clearSelection();
      return;
    }
    this.api.search(term).subscribe({
      next: (v) => {
        if (generation !== this.searchGeneration) return;
        if (this.selected() && !v.some((item) => item.id === this.selected()?.id)) {
          this.clearSelection();
        }
        this.results.set(this.mergeSelectedIntoResults(v));
      },
      error: (e) => {
        if (generation === this.searchGeneration) this.handle(e);
      },
    });
  }
  refreshPage(): void {
    if (this.canAuthorize()) this.loadModifications();
    if (this.canCash()) this.loadVoucherLists();
  }
  changeListView(view: 'pending' | 'history'): void {
    this.listView.set(view);
    this.listFilter.set('');
  }
  loadVoucherLists(): void {
    this.listLoading.set(true);
    forkJoin({ pending: this.api.list('pending'), history: this.api.list('history') })
      .pipe(finalize(() => this.listLoading.set(false)))
      .subscribe({
        next: ({ pending, history }) => {
          this.pendingVouchers.set(pending);
          this.historyVouchers.set(history);
        },
        error: (error) => this.handle(error),
      });
  }
  open(id: string): void {
    this.bankName = '';
    this.clabe = '';
    this.clabeConfirm = '';
    this.useAnotherBankAccount = false;
    this.paymentMethod = 'TRANSFER';
    this.paymentClabe = '';
    this.correctFirstName = false;
    this.correctFirstLastName = false;
    this.correctSecondLastName = false;
    this.correctBirthDate = false;
    this.correctPhoneNumber = false;
    this.correctCurp = false;
    this.correctAddress = false;
    this.correctionFirstNameControl.reset();
    this.correctionFirstLastNameControl.reset();
    this.correctionSecondLastNameControl.reset();
    this.correctionBirthDateControl.reset();
    this.correctionPhoneNumberControl.reset();
    this.correctionCurpControl.reset();
    this.correctionReason = '';
    this.api
      .detail(id)
      .subscribe({ next: (v) => this.setSelected(v), error: (e) => this.handle(e) });
  }
  cashStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      GENERATED: 'Generado · pendiente de caja',
      RELEASED: 'Liberado · pendiente de cobro',
      CASH_VALIDATION: 'En validación de caja',
      CASHED: 'Cobrado',
      CORRECTION_PENDING: 'Corrección pendiente',
      REJECTED: 'Rechazado',
      CANCELLED: 'Cancelado',
      VOIDED: 'Anulado',
    };

    return labels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('es-MX');
  }
  hasAddressProof(voucher: CashVoucher): boolean {
    return !!voucher.address?.['address_proof_media_id'];
  }
  uploadAddressProof(voucher: CashVoucher, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const applicationId = voucher.document_owner?.owner_id;
    if (!file || !applicationId || this.uploadingAddressProof()) return;

    const validationError = validateUploadFile(file, PRIVATE_MEDIA_FILE_RULE);
    if (validationError) {
      this.error.set(validationError);
      input.value = '';
      return;
    }

    this.clear();
    this.uploadingAddressProof.set(true);
    this.api
      .uploadAddressProof(applicationId, file)
      .pipe(finalize(() => this.uploadingAddressProof.set(false)))
      .subscribe({
        next: () =>
          this.api.detail(voucher.id).subscribe({
            next: (updated) => this.setSelected(updated),
            error: (error) => this.handle(error),
          }),
        error: (error) => this.handle(error),
      });
  }
  release(v: CashVoucher): void {
    if (false) {
      if (!this.bankName || this.clabe !== this.clabeConfirm || this.clabe.length !== 18) {
        this.error.set(
          'Por favor, ingresa un banco válido y asegúrate de que la CLABE tenga 18 dígitos y coincida.',
        );
        return;
      }
      this.run(this.api.release(v.id, v.lock_version));
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
    if (this.paymentMethod === 'TRANSFER') {
      this.transactionControl.markAsTouched();
    }
    if (this.paymentMethod === 'TRANSFER' && this.transactionControl.invalid) {
      this.error.set('Corrige el número de transacción marcado antes de feriar el vale.');
      queueMicrotask(() => this.transactionInput?.nativeElement.focus());
      return;
    }
    if (this.paymentMethod === 'TRANSFER' && !/^\d{18}$/.test(this.paymentClabe)) {
      this.error.set('Captura una CLABE válida de 18 dígitos para la transferencia.');
      return;
    }
    if (this.paymentMethod === 'TRANSFER' && !this.confirmed) return;
    this.run(this.api.cash(v.id, this.paymentMethod, this.paymentMethod === 'TRANSFER' ? this.transactionControl.value : '', this.paymentMethod === 'TRANSFER' ? this.paymentClabe : '', v.lock_version), () => {
      this.transactionControl.reset();
      this.paymentClabe = '';
      this.confirmed = false;
    });
  }

  allowOnlyTransactionDigits(event: KeyboardEvent): void {
    const navigationKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (event.ctrlKey || event.metaKey || navigationKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  sanitizeTransactionNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, 25);
    if (input.value !== sanitized) input.value = sanitized;
    this.transactionControl.setValue(sanitized);
  }
  requestCorrection(v: CashVoucher): void {
    const fields: Array<
      | 'first_name'
      | 'first_last_name'
      | 'second_last_name'
      | 'birth_date'
      | 'phone_number'
      | 'curp'
      | 'address'
    > = [];
    const changes: ModificationChanges = {};
    if (this.correctFirstName) fields.push('first_name');
    if (this.correctFirstLastName) fields.push('first_last_name');
    if (this.correctSecondLastName) fields.push('second_last_name');
    if (this.correctBirthDate) fields.push('birth_date');
    if (this.correctPhoneNumber) fields.push('phone_number');
    if (this.correctCurp) fields.push('curp');
    if (this.correctAddress) fields.push('address');
    if (!fields.length) {
      this.error.set('Selecciona al menos un campo para corregir.');
      return;
    }
    if (this.correctFirstName) {
      this.correctionFirstNameControl.markAsTouched();
      if (this.correctionFirstNameControl.invalid) {
        this.error.set('Captura el nombre corregido.');
        return;
      }
      changes.first_name = this.correctionFirstNameControl.value.trim();
    }
    if (this.correctFirstLastName) {
      this.correctionFirstLastNameControl.markAsTouched();
      if (this.correctionFirstLastNameControl.invalid) {
        this.error.set('Captura el apellido paterno corregido.');
        return;
      }
      changes.first_last_name = this.correctionFirstLastNameControl.value.trim();
    }
    if (this.correctSecondLastName) {
      this.correctionSecondLastNameControl.markAsTouched();
      if (this.correctionSecondLastNameControl.invalid) {
        this.error.set('Captura el apellido materno corregido.');
        return;
      }
      changes.second_last_name = this.correctionSecondLastNameControl.value.trim();
    }
    if (this.correctBirthDate) {
      this.correctionBirthDateControl.markAsTouched();
      if (this.correctionBirthDateControl.invalid) {
        this.error.set('Captura la fecha de nacimiento corregida.');
        return;
      }
      changes.birth_date = this.correctionBirthDateControl.value;
    }
    if (this.correctPhoneNumber) {
      this.correctionPhoneNumberControl.markAsTouched();
      if (this.correctionPhoneNumberControl.invalid) {
        this.error.set('Captura un teléfono válido con lada, por ejemplo +526181234567.');
        return;
      }
      changes.phone_number = this.correctionPhoneNumberControl.value;
    }
    if (this.correctCurp) {
      this.normalizeCorrectionCurp();
      this.correctionCurpControl.markAsTouched();
      if (this.correctionCurpControl.invalid) {
        this.error.set('Corrige la CURP marcada antes de enviar la solicitud.');
        queueMicrotask(() => this.correctionCurpInput?.nativeElement.focus());
        return;
      }
      changes.curp = this.correctionCurpControl.value;
    }
    if (this.correctAddress && !this.correctionAddressForm?.validarYEnfocarPrimerError()) {
      this.error.set('Completa correctamente los campos marcados del domicilio.');
      return;
    }
    if (this.correctAddress) changes.address = { ...this.correctionAddress };
    if (false) {
      this.correctionReasonModel?.control.markAsTouched();
      this.error.set('Captura el motivo de la corrección.');
      queueMicrotask(() => this.correctionReasonInput?.nativeElement.focus());
      return;
    }
    this.clear();
    this.busy.set(true);
    this.api
      .requestModification(v.id, fields, changes)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
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
    if (!this.modificationId || this.token.trim().length !== 8) {
      this.error.set('Introduce el token completo de 8 caracteres.');
      return;
    }
    this.clear();
    this.busy.set(true);
    this.api
      .apply(this.modificationId, this.token.trim().toUpperCase(), this.modificationVersion)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
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
    this.api.decide(item.id, decision, item.lock_version).subscribe({
      next: (v) => {
        this.issuedToken.set(v.token ?? '');
        this.tokenExpires.set(v.expires_at ?? '');
        delete this.decisionReasons[item.id];
        if (decision === 'REJECT' && this.selected()?.id === item.voucher_id) {
          this.open(item.voucher_id);
        }
        this.loadModifications();
      },
      error: (e) => this.handle(e),
    });
  }
  private run(request: ReturnType<CajaValesApiService['release']>, onSuccess?: () => void): void {
    this.busy.set(true);
    this.clear();
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: (v) => {
        this.setSelected(v);
        this.loadVoucherLists();
        onSuccess?.();
      },
      error: (e) => this.handle(e),
    });
  }

  ngOnDestroy(): void {
    this.clearPreviews();
  }

  private setSelected(voucher: CashVoucher): void {
    this.selected.set(voucher);
    this.results.update((items) =>
      items.map((item) => (item.id === voucher.id ? { ...item, ...voucher } : item)),
    );
    this.modificationId = voucher.modification_request?.id ?? '';
    this.modificationVersion = voucher.modification_request?.lock_version ?? 1;
    this.loadPreview(
      voucher.identity?.official_id_media_id ?? null,
      this.identityPreview,
      'Identificación oficial',
    );
    this.loadPreview(
      voucher.address?.['address_proof_media_id'] ?? null,
      this.addressProofPreview,
      'Comprobante de domicilio',
    );
  }

  private mergeSelectedIntoResults(items: CashVoucher[]): CashVoucher[] {
    const current = this.selected();
    if (!current) return items;
    return items.map((item) => (item.id === current.id ? { ...item, ...current } : item));
  }

  private clearSelection(): void {
    this.selected.set(null);
    this.modificationId = '';
    this.modificationVersion = 1;
    this.clearPreviews();
  }

  correctionFieldsLabel(
    fields: Array<
      | 'first_name'
      | 'first_last_name'
      | 'second_last_name'
      | 'birth_date'
      | 'phone_number'
      | 'curp'
      | 'address'
    >,
  ): string {
    const labels: Record<string, string> = {
      first_name: 'Nombre',
      first_last_name: 'Apellido paterno',
      second_last_name: 'Apellido materno',
      birth_date: 'Fecha de nacimiento',
      phone_number: 'Teléfono',
      curp: 'CURP',
      address: 'Domicilio',
    };
    return fields.map((field) => labels[field] ?? field).join(' y ');
  }

  addressLabel(address: Record<string, string>): string {
    const number = [
      address['exterior_number'],
      address['interior_number'] ? `Int. ${address['interior_number']}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return [
      address['street'],
      number,
      address['neighborhood'],
      address['postal_code'],
      address['municipality'],
      address['city'],
      address['state'],
    ]
      .filter(Boolean)
      .join(', ');
  }

  normalizeCorrectionCurp(): void {
    const normalized = this.correctionCurpControl.value.trim().toUpperCase();
    this.correctionCurpControl.setValue(normalized, { emitEvent: false });
    this.correctionCurpControl.updateValueAndValidity({ emitEvent: false });
  }

  onCorrectionAddressChange(address: AddressResult): void {
    this.correctionAddress = {
      street: address.street,
      exterior_number: address.exterior_number,
      interior_number: address.interior_number ?? '',
      neighborhood: address.neighborhood,
      postal_code: address.zip_code,
      municipality: address.municipality,
      city: address.city,
      state: address.state,
      country: address.country || 'MX',
    };
  }

  private loadPreview(
    mediaId: string | null,
    target: WritableSignal<DocumentPreview | null>,
    fileName: string,
  ): void {
    this.revokePreview(target);
    if (!mediaId) return;

    this.media.download(mediaId).subscribe({
      next: (blob) =>
        target.set({
          url: URL.createObjectURL(blob),
          mimeType: blob.type || 'application/octet-stream',
          fileName,
        }),
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
