import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { SessionStore } from '../../../core/session/session.store';
import { ValesApiService, VoucherClient, VoucherPreview, VoucherProduct, VoucherView } from '../data-access/vales-api.service';

@Component({
  selector: 'app-vales-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vales-page.component.html',
  styleUrl: './vales-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValesPageComponent implements OnInit {
  private readonly api = inject(ValesApiService);
  private readonly session = inject(SessionStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.formBuilder.nonNullable.group({
    search: this.formBuilder.nonNullable.control(''),
    clientId: this.formBuilder.nonNullable.control(''),
    productVersionId: this.formBuilder.nonNullable.control(''),
  });
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly products = signal<VoucherProduct[]>([]);
  protected readonly clients = signal<VoucherClient[]>([]);
  protected readonly vouchers = signal<VoucherView[]>([]);
  protected readonly previewData = signal<VoucherPreview | null>(null);
  protected readonly generated = signal<VoucherView | null>(null);
  protected readonly loadingHistory = signal(true);
  protected readonly loadingProducts = signal(false);
  protected readonly searchingClients = signal(false);
  protected readonly searchedClients = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly selectedClient = computed(() => this.clients().find((client) => client.id === this.formValue().clientId) ?? null);
  protected readonly selectedProduct = computed(() => this.products().find((product) => product.id === this.formValue().productVersionId) ?? null);
  protected readonly currentStep = computed(() => this.previewData() || this.selectedProduct() ? 3 : this.selectedClient() ? 2 : 1);
  protected readonly canPreview = computed(() => !!this.selectedClient() && !!this.selectedProduct() && !this.busy());

  ngOnInit(): void {
    this.reloadHistory();
    if (!this.canCreate()) return;
    this.loadingProducts.set(true);
    this.api.listarProductos().pipe(finalize(() => this.loadingProducts.set(false))).subscribe({
      next: (products) => this.products.set(products),
      error: (error) => this.handle(error),
    });
    this.form.controls.search.valueChanges.pipe(
      map((value) => value.trim()),
      debounceTime(250),
      distinctUntilChanged(),
      tap((term) => {
        this.searchedClients.set(term.length >= 2);
        this.form.controls.clientId.setValue('');
        this.previewData.set(null);
        this.generated.set(null);
        if (term.length < 2) {
          this.clients.set([]);
          this.searchingClients.set(false);
        }
      }),
      switchMap((term) => {
        if (term.length < 2) return of<VoucherClient[]>([]);
        this.searchingClients.set(true);
        return this.api.buscarClientesElegibles(term).pipe(
          catchError((error: HttpErrorResponse) => {
            this.handle(error);
            return of<VoucherClient[]>([]);
          }),
          finalize(() => this.searchingClients.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((clients) => this.clients.set(clients));
  }

  protected canCreate(): boolean {
    return this.session.roles().includes('distributor') && this.session.permissions().includes('vouchers.create_own');
  }

  protected selectClient(client: VoucherClient): void {
    this.form.controls.clientId.setValue(client.id);
    this.previewData.set(null);
    this.generated.set(null);
    this.clearError();
  }

  protected selectProduct(product: VoucherProduct): void {
    this.form.controls.productVersionId.setValue(product.id);
    this.previewData.set(null);
    this.generated.set(null);
    this.clearError();
  }

  protected preview(): void {
    const { clientId, productVersionId } = this.form.getRawValue();
    if (this.busy() || !clientId || !productVersionId) return;
    this.busy.set(true);
    this.clearError();
    this.generated.set(null);
    this.api.previsualizar(clientId, productVersionId).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: (data) => this.previewData.set(data),
      error: (error) => this.handle(error),
    });
  }

  protected generate(): void {
    const { clientId, productVersionId } = this.form.getRawValue();
    if (this.busy() || !clientId || !productVersionId || !this.previewData()) return;
    this.busy.set(true);
    this.clearError();
    this.api.generar(clientId, productVersionId).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: (voucher) => {
        this.generated.set(voucher);
        this.previewData.set(null);
        this.form.patchValue({ clientId: '', productVersionId: '', search: '' });
        this.clients.set([]);
        this.searchedClients.set(false);
        this.reloadHistory();
      },
      error: (error) => this.handle(error),
    });
  }

  protected typeLabel(type: VoucherView['type'] | VoucherPreview['voucher_type']): string {
    return type === 'PREVALE' ? 'Prevale' : 'Vale digital';
  }

  protected statusLabel(status: string): string {
    const labels: Record<string, string> = {
      GENERATED: 'Generado · pendiente de caja', RELEASED: 'Liberado · pendiente de cobro',
      CASHED: 'Cobrado', CANCELLED: 'Cancelado', VOIDED: 'Anulado',
    };
    return labels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('es-MX');
  }

  private reloadHistory(): void {
    this.loadingHistory.set(true);
    this.api.listar().subscribe({
      next: (response) => { this.vouchers.set(response.data); this.loadingHistory.set(false); },
      error: (error) => { this.loadingHistory.set(false); this.handle(error); },
    });
  }

  private clearError(): void { this.error.set(''); }

  private handle(error: HttpErrorResponse): void {
    const code = error.error?.error?.code;
    const details = error.error?.error?.details;
    if (code === 'CREDIT_50_PERCENT_RULE_NOT_SATISFIED' && details?.lower_limit && details?.upper_limit) {
      this.error.set(`Por la regla temporal de tu línea de crédito, el siguiente vale debe estar entre ${this.formatCurrency(details.lower_limit)} y ${this.formatCurrency(details.upper_limit)}. Elige un importe dentro de ese rango.`);

      return;
    }
    const messages: Record<string, string> = {
      VOUCHER_FINANCIAL_CONFIGURATION_MISSING: 'Gerencia debe publicar las condiciones financieras antes de otorgar este vale.',
      PRODUCT_FINANCIAL_CONFIGURATION_MISSING: 'El producto publicado no tiene completas sus condiciones financieras. Solicita que publiquen una versión completa.',
      CLIENT_NOT_ASSIGNED_TO_DISTRIBUTOR: 'Esta persona no pertenece a tu distribuidora activa. Busca una persona de tu cartera o registra una nueva.',
      CREDIT_INSUFFICIENT: 'El importe elegido supera el crédito disponible. Elige otro producto o solicita un incremento.',
      CREDIT_50_PERCENT_RULE_NOT_SATISFIED: 'El importe no cumple la regla temporal de tu línea de crédito. Revisa el rango permitido antes de continuar.',
    };
    this.error.set(messages[code] ?? error.error?.error?.message ?? 'No fue posible completar la operación. Inténtalo nuevamente.');
  }

  private formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
  }
}
