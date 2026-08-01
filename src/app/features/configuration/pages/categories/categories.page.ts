import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { CategoriesService } from '../../data-access/services/categories.service';
import { CategoryVersion } from '../../models/category.model';
import { SessionStore } from '@core/session/session.store';
import { ServerTableComponent, TableColumn, TablePageEvent } from '@shared/tables/server-table.component';
import { UiStateComponent, UiStateKind } from '@shared/components/ui-state.component';
import { CategoryVersionFormComponent, CategoryFormData } from '../../forms/category-version/category-version.form';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, ServerTableComponent, UiStateComponent, CategoryVersionFormComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Categorías</h1>
          <p class="text-gray-600">Catálogo global de categorías de distribuidora</p>
        </div>
        <button
          *ngIf="canEdit()"
          (click)="openCreateModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Nueva Categoría
        </button>
      </div>

      <ng-container *ngIf="loadState() === 'content' || loadState() === 'empty'; else stateTemplate">
        <mv-server-table
          caption="Categorías"
          [columns]="columns"
          [rows]="categories()"
          [state]="loadState() === 'empty' ? 'empty' : 'content'"
          [currentPage]="page()"
          [perPage]="perPage()"
          [total]="total()"
          (pageChange)="onPageChange($event)"
        >
        </mv-server-table>
        <div class="mt-4 flex flex-col space-y-2">
           <div *ngFor="let cat of categories()" class="p-4 bg-white rounded shadow text-sm">
             <strong>{{ cat.name }}</strong> ({{ cat.publicId }})<br>
             Tasa Ganancia: {{ cat.distributorProfitRate }} | Estado: {{ cat.status }}<br>
             <button (click)="viewHistory(cat.publicId)" class="text-blue-600 underline mt-2">Ver Historial de Versiones</button>
           </div>
        </div>
      </ng-container>

      <ng-template #stateTemplate>
        <mv-ui-state [kind]="uiStateKind()" [retryable]="true" (retry)="loadCategories()"></mv-ui-state>
      </ng-template>

      <!-- Modal de Creación de Categoría (FE08.01) -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Nueva Categoría</h3>
          </div>
          <div class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <app-category-version-form
              [initialData]="null"
              [isSubmitting]="isSubmitting()"
              (save)="onCreate($event)"
              (cancel)="closeModal()"
            ></app-category-version-form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesPageComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly categories = signal<CategoryVersion[]>([]);
  readonly loadState = signal<'content' | 'loading' | 'empty' | 'error'>('loading');
  readonly uiStateKind = signal<UiStateKind>('loading');
  
  readonly page = signal(1);
  readonly perPage = signal(20);
  readonly total = signal(0);

  isModalOpen = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly columns: TableColumn<CategoryVersion>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'distributorProfitRate', label: 'Tasa Ganancia' },
    { key: 'status', label: 'Estado' },
    { key: 'versionNumber', label: 'Versión' }
  ];

  ngOnInit() {
    this.loadCategories();
  }

  canEdit(): boolean {
    const role = this.sessionStore.access()?.role;
    return role === 'GENERAL_MANAGER';
  }

  loadCategories() {
    this.loadState.set('loading');
    this.uiStateKind.set('loading');

    this.categoriesService.list(undefined, this.page(), this.perPage()).pipe(
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
        this.categories.set(items);
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
    this.loadCategories();
  }

  openCreateModal() {
    this.errorMessage.set(null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isSubmitting.set(false);
  }

  onCreate(data: CategoryFormData) {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.categoriesService.createCategory(data.name, data.description, data.distributorProfitRate).pipe(
      finalize(() => this.isSubmitting.set(false)),
      catchError((error) => {
        console.error(error);
        const msg = error.error?.error?.message || 'Error desconocido al crear la categoría.';
        this.errorMessage.set(msg);
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.closeModal();
        this.loadCategories();
      }
    });
  }

  viewHistory(publicId: string | undefined) {
    if (publicId) {
      this.router.navigate(['/administrativa/categorias', publicId, 'versiones']);
    }
  }
}
