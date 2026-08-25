import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { SessionStore } from '../../../core/session/session.store';
import {
  ValesApiService,
  VoucherClient,
  VoucherCreditLine,
  VoucherFinancialContext,
  VoucherPreview,
  VoucherProduct,
  VoucherView,
} from '../data-access/vales-api.service';
import { StrictNumberInputDirective } from '../../../shared/directives/strict-number-input.directive';
import { HistoryPageHeaderComponent } from '../../../shared/components/history/history-page-header.component';
import { HistoryPaginationComponent } from '../../../shared/components/history/history-pagination.component';
import { HistoryFilterBarComponent } from '../../../shared/components/history/history-filter-bar.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-vales-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    StrictNumberInputDirective,
    HistoryPageHeaderComponent,
    HistoryPaginationComponent,
    HistoryFilterBarComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './vales-page.component.html',
  styleUrl: './vales-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValesPageComponent implements OnInit {
  private readonly api = inject(ValesApiService);
  private readonly session = inject(SessionStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.formBuilder.group({
    search: this.formBuilder.nonNullable.control(''),
    clientId: this.formBuilder.nonNullable.control(''),
    productVersionId: this.formBuilder.nonNullable.control(''),
    installmentCount: this.formBuilder.control<number | null>(null),
  });
  protected readonly clientForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    firstLastName: ['', [Validators.required, Validators.maxLength(120)]],
    secondLastName: ['', [Validators.maxLength(120)]],
  });
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
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
  protected readonly creatingClient = signal(false);
  protected readonly clientDialogOpen = signal(false);
  protected readonly financialContext = signal<VoucherFinancialContext | null>(null);
  protected readonly creditLine = signal<VoucherCreditLine | null>(null);
  protected readonly error = signal('');
  protected readonly selectedVoucherForInstallments = signal<VoucherView | null>(null);
  protected readonly historyPage = signal(1);
  protected readonly historyPages = signal(1);
  protected readonly historyTotal = signal(0);
  protected readonly historyStatus = signal('');

  protected readonly selectedClient = computed(
    () => this.clients().find((client) => client.id === this.formValue().clientId) ?? null,
  );
  protected readonly selectedProduct = computed(
    () =>
      this.products().find((product) => product.id === this.formValue().productVersionId) ?? null,
  );
  protected readonly currentStep = computed(() =>
    this.previewData() ? 4 : this.selectedProduct() ? 3 : this.selectedClient() ? 2 : 1,
  );
  protected readonly categoryLabel = computed(() => {
    const category = this.financialContext()?.category;
    return category
      ? `${Number(category.percentage) * 100}% · ${category.name}`
      : 'Sin categoría vigente';
  });
  protected readonly canPreview = computed(() => {
    const value = this.formValue();
    return (
      !!this.selectedClient() &&
      !!this.selectedProduct() &&
      !this.busy() &&
      value.installmentCount !== null
    );
  });

  ngOnInit(): void {
    this.reloadHistory();
    if (!this.canCreate()) return;
    this.loadingProducts.set(true);
    this.api
      .listarProductos()
      .pipe(finalize(() => this.loadingProducts.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error) => this.handle(error),
      });
    this.api.obtenerContextoFinanciero().subscribe({
      next: (context) => this.financialContext.set(context),
      error: (error) => this.handle(error),
    });
    this.api.obtenerLineaCreditoPropia().subscribe({
      next: (creditLine) => this.creditLine.set(creditLine),
      error: (error) => this.handle(error),
    });

    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(
          (prev, curr) =>
            prev.productVersionId === curr.productVersionId &&
            prev.clientId === curr.clientId &&
            prev.installmentCount === curr.installmentCount,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.canPreview()) {
          this.preview();
        } else {
          this.previewData.set(null);
        }
      });

    this.form.controls.search.valueChanges
      .pipe(
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
      )
      .subscribe((clients) => this.clients.set(clients));
  }

  protected canCreate(): boolean {
    return (
      this.session.roles().includes('distributor') &&
      this.session.permissions().includes('vouchers.create_own')
    );
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
    const { clientId, productVersionId, installmentCount } = this.form.getRawValue();
    if (this.busy() || !clientId || !productVersionId || installmentCount === null) return;
    this.busy.set(true);
    this.clearError();
    this.generated.set(null);
    this.api
      .previsualizar(clientId, productVersionId, installmentCount)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (data) => this.previewData.set(data),
        error: (error) => this.handle(error),
      });
  }

  protected generate(): void {
    const { clientId, productVersionId, installmentCount } = this.form.getRawValue();
    if (
      this.busy() ||
      !clientId ||
      !productVersionId ||
      installmentCount === null ||
      !this.previewData()
    )
      return;
    this.busy.set(true);
    this.clearError();
    this.api
      .generar(clientId, productVersionId, installmentCount)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
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
      GENERATED: 'Generado · pendiente de caja',
      RELEASED: 'Liberado · pendiente de cobro',
      CASHED: 'Cobrado',
      CANCELLED: 'Cancelado',
      VOIDED: 'Anulado',
    };
    return labels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('es-MX');
  }

  protected changeHistoryPage(page: number): void {
    if (page < 1 || page > this.historyPages() || this.loadingHistory()) return;
    this.reloadHistory(page);
  }

  protected applyHistoryStatus(status: string): void {
    this.historyStatus.set(status);
    this.reloadHistory(1);
  }

  private reloadHistory(page = this.historyPage()): void {
    this.loadingHistory.set(true);
    this.api.listar(page, this.historyStatus()).subscribe({
      next: (response) => {
        this.vouchers.set(response.data);
        this.historyPage.set(response.meta.current_page);
        this.historyPages.set(response.meta.last_page);
        this.historyTotal.set(response.meta.total);
        this.loadingHistory.set(false);
      },
      error: (error) => {
        this.loadingHistory.set(false);
        this.handle(error);
      },
    });
  }

  private clearError(): void {
    this.error.set('');
  }

  private handle(error: HttpErrorResponse): void {
    const code = error.error?.error?.code;
    const details = error.error?.error?.details;
    if (
      code === 'CREDIT_50_PERCENT_RULE_NOT_SATISFIED' &&
      details?.lower_limit &&
      details?.upper_limit
    ) {
      this.error.set(
        `Por la regla temporal de tu línea de crédito, el siguiente vale debe estar entre ${this.formatCurrency(details.lower_limit)} y ${this.formatCurrency(details.upper_limit)}. Elige un importe dentro de ese rango.`,
      );

      return;
    }
    const messages: Record<string, string> = {
      VOUCHER_FINANCIAL_CONFIGURATION_MISSING:
        'Gerencia debe publicar las condiciones financieras antes de otorgar este vale.',
      PRODUCT_FINANCIAL_CONFIGURATION_MISSING:
        'El producto publicado no tiene completas sus condiciones financieras. Solicita que publiquen una versión completa.',
      CLIENT_NOT_ASSIGNED_TO_DISTRIBUTOR:
        'Esta persona no pertenece a tu distribuidora activa. Busca una persona de tu cartera o registra una nueva.',
      CREDIT_INSUFFICIENT:
        'El importe elegido supera el crédito disponible. Elige otro producto o solicita un incremento.',
      CREDIT_50_PERCENT_RULE_NOT_SATISFIED:
        'El importe no cumple la regla temporal de tu línea de crédito. Revisa el rango permitido antes de continuar.',
    };
    this.error.set(
      messages[code] ??
        error.error?.error?.message ??
        'No fue posible completar la operación. Inténtalo nuevamente.',
    );
  }

  private formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
      Number(value),
    );
  }

  protected openClientDialog(): void {
    this.clientForm.reset({ firstName: '', firstLastName: '', secondLastName: '' });
    this.clientDialogOpen.set(true);
  }

  protected percentage(value: string): string {
    return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(Number(value) * 100)} %`;
  }

  protected isCreditInsufficient(amount: string, available: string): boolean {
    return Number(amount) > Number(available);
  }

  protected closeClientDialog(): void {
    if (!this.creatingClient()) this.clientDialogOpen.set(false);
  }

  protected installmentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      OVERDUE: 'Atrasado',
      SETTLED: 'Pagado',
      PARTIALLY_PAID: 'Abono parcial',
    };
    return labels[status] ?? status;
  }

  protected createClient(): void {
    if (this.clientForm.invalid || this.creatingClient()) {
      this.clientForm.markAllAsTouched();
      return;
    }
    const { firstName, firstLastName, secondLastName } = this.clientForm.getRawValue();
    this.creatingClient.set(true);
    this.clearError();
    this.api
      .crearClienteRápido(firstName.trim(), firstLastName.trim(), secondLastName.trim())
      .pipe(finalize(() => this.creatingClient.set(false)))
      .subscribe({
        next: (client) => {
          this.clients.set([client]);
          this.form.controls.search.setValue(client.full_name, { emitEvent: false });
          this.selectClient(client);
          this.clientDialogOpen.set(false);
        },
        error: (error) => this.handle(error),
      });
  }

  viewInstallments(voucher: VoucherView): void {
    this.selectedVoucherForInstallments.set(voucher);
  }
  closeInstallments(): void {
    this.selectedVoucherForInstallments.set(null);
  }
}
