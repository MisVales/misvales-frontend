import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { ProductsService } from '../../data-access/services/products.service';
import { ProductVersion } from '../../models/product.model';
import { SessionStore } from '@core/session/session.store';
import { ServerTableComponent, TableColumn, TablePageEvent } from '@shared/tables/server-table.component';
import { UiStateComponent, UiStateKind } from '@shared/components/ui-state.component';
import { ProductVersionFormComponent, ProductFormData } from '../../forms/product-version/product-version.form';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ServerTableComponent, UiStateComponent, ProductVersionFormComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Productos Financieros</h1>
          <p class="text-gray-600">Catálogo global de productos y préstamos</p>
        </div>
        <button
          *ngIf="canEdit()"
          (click)="openCreateModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Nuevo Producto
        </button>
      </div>

      <ng-container *ngIf="loadState() === 'content' || loadState() === 'empty'; else stateTemplate">
        <mv-server-table
          caption="Productos"
          [columns]="columns"
          [rows]="products()"
          [state]="loadState() === 'empty' ? 'empty' : 'content'"
          [currentPage]="page()"
          [perPage]="perPage()"
          [total]="total()"
          (pageChange)="onPageChange($event)"
        >
        </mv-server-table>
        <div class="mt-4 flex flex-col space-y-2">
           <div *ngFor="let p of products()" class="p-4 bg-white rounded shadow text-sm">
             <strong>Monto: {{ p.amount }} ({{ p.fortnightCount }} quincenas)</strong><br>
             ID: {{ p.publicId }} | Com. Préstamo: {{ p.loanCommissionRate }} | Int. Quincenal: {{ p.interestRatePerFortnight }} | Seguro: {{ p.insuranceAmount }}<br>
             Estado: {{ p.status }} (V{{ p.versionNumber }})<br>
             <button (click)="viewHistory(p.publicId)" class="text-blue-600 underline mt-2">Ver Historial de Versiones</button>
           </div>
        </div>
      </ng-container>

      <ng-template #stateTemplate>
        <mv-ui-state [kind]="uiStateKind()" [retryable]="true" (retry)="loadProducts()"></mv-ui-state>
      </ng-template>

      <!-- Modal de Creación -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Nuevo Producto</h3>
          </div>
          <div class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <app-product-version-form
              [initialData]="null"
              [isSubmitting]="isSubmitting()"
              (save)="onCreate($event)"
              (cancel)="closeModal()"
            ></app-product-version-form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductsPageComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly products = signal<ProductVersion[]>([]);
  readonly loadState = signal<'content' | 'loading' | 'empty' | 'error'>('loading');
  readonly uiStateKind = signal<UiStateKind>('loading');
  
  readonly page = signal(1);
  readonly perPage = signal(20);
  readonly total = signal(0);

  isModalOpen = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly columns: TableColumn<ProductVersion>[] = [
    { key: 'amount', label: 'Monto' },
    { key: 'fortnightCount', label: 'Quincenas' },
    { key: 'loanCommissionRate', label: 'Comisión Préstamo' },
    { key: 'interestRatePerFortnight', label: 'Interés Quincenal' },
    { key: 'insuranceAmount', label: 'Seguro' },
    { key: 'status', label: 'Estado' },
    { key: 'versionNumber', label: 'Versión' }
  ];

  ngOnInit() {
    this.loadProducts();
  }

  canEdit(): boolean {
    const role = this.sessionStore.access()?.role;
    return role === 'GENERAL_MANAGER';
  }

  loadProducts() {
    this.loadState.set('loading');
    this.uiStateKind.set('loading');

    this.productsService.list(undefined, this.page(), this.perPage()).pipe(
      catchError(() => {
        this.loadState.set('error');
        this.uiStateKind.set('error');
        return of(null);
      }),
      finalize(() => {
        if (this.loadState() === 'loading') {
          this.loadState.set('content');
        }
      })
    ).subscribe(response => {
      if (response) {
        const items = response.data.flatMap(d => d.result);
        this.products.set(items);
        this.total.set(response.meta.total);
        if (items.length === 0) {
          this.loadState.set('empty');
          this.uiStateKind.set('empty');
        } else {
          this.loadState.set('content');
        }
      }
    });
  }

  onPageChange(event: TablePageEvent) {
    this.page.set(event.page);
    this.perPage.set(event.perPage);
    this.loadProducts();
  }

  openCreateModal() {
    this.errorMessage.set(null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isSubmitting.set(false);
  }

  onCreate(data: ProductFormData) {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.productsService.createProduct(
      data.amount,
      data.loanCommissionRate,
      data.interestRatePerFortnight,
      data.insuranceAmount,
      data.fortnightCount
    ).pipe(
      finalize(() => this.isSubmitting.set(false)),
      catchError(err => {
          console.error(err);
          const msg = err.error?.error?.message || 'Error al procesar la solicitud.';
          this.errorMessage.set(msg);
          return of(null);
        })
    ).subscribe(result => {
      if (result) {
        this.closeModal();
        this.loadProducts();
      }
    });
  }

  viewHistory(publicId: string | undefined) {
    if (publicId) {
      this.router.navigate(['/administrativa/productos', publicId, 'versiones']);
    }
  }
}

