import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { ConfigurationsService } from '../../data-access/services/configurations.service';
import { ConfigurationVersion } from '../../models/configuration.model';
import { SessionStore } from '@core/session/session.store';
import { ServerTableComponent, TableColumn, TablePageEvent } from '@shared/tables/server-table.component';
import { UiStateComponent, UiStateKind } from '@shared/components/ui-state.component';
import { ConfigurationVersionFormComponent, ConfigurationFormData } from '../../forms/configuration-version/configuration-version.form';

@Component({
  selector: 'app-configurations-page',
  standalone: true,
  imports: [CommonModule, ServerTableComponent, UiStateComponent, ConfigurationVersionFormComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Configuraciones Globales</h1>
          <p class="text-gray-600">Administración de configuraciones del sistema</p>
        </div>
        <button
          *ngIf="canEdit()"
          (click)="openCreateModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Nueva Versión
        </button>
      </div>

      <ng-container *ngIf="loadState() === 'content' || loadState() === 'empty'; else stateTemplate">
        <mv-server-table
          caption="Configuraciones"
          [columns]="columns"
          [rows]="configurations()"
          [state]="loadState() === 'empty' ? 'empty' : 'content'"
          [currentPage]="page()"
          [perPage]="perPage()"
          [total]="total()"
          (pageChange)="onPageChange($event)"
        >
          <!-- Using ng-template for custom column rendering if needed, else value mapping in component -->
        </mv-server-table>
      </ng-container>

      <ng-template #stateTemplate>
        <mv-ui-state [kind]="uiStateKind()" [retryable]="true" (retry)="loadConfigurations()"></mv-ui-state>
      </ng-template>

      <!-- Modal de Creación / Edición -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Crear Borrador de Configuración</h3>
          </div>
          <div class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <app-configuration-version-form
              [initialData]="null"
              [isSubmitting]="isSubmitting()"
              (save)="onSaveDraft($event)"
              (cancel)="closeModal()"
            ></app-configuration-version-form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfigurationsPageComponent implements OnInit {
  private readonly configurationsService = inject(ConfigurationsService);
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly configurations = signal<ConfigurationVersion[]>([]);
  readonly loadState = signal<'content' | 'loading' | 'empty' | 'error'>('loading');
  readonly uiStateKind = signal<UiStateKind>('loading');
  
  readonly page = signal(1);
  readonly perPage = signal(20);
  readonly total = signal(0);

  isModalOpen = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly columns: TableColumn<ConfigurationVersion>[] = [
    { key: 'key', label: 'Clave' },
    { key: 'type', label: 'Tipo' },
    { key: 'value', label: 'Valor' },
    { key: 'status', label: 'Estado' },
    { key: 'effectiveFrom', label: 'Vigente desde' },
    { key: 'versionNumber', label: 'Versión' }
  ];

  ngOnInit() {
    this.loadConfigurations();
  }

  canEdit(): boolean {
    const role = this.sessionStore.access()?.role;
    return role === 'GENERAL_MANAGER';
  }

  loadConfigurations() {
    this.loadState.set('loading');
    this.uiStateKind.set('loading');

    this.configurationsService.list(undefined, this.page(), this.perPage()).pipe(
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
        this.configurations.set(items);
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
    this.loadConfigurations();
  }

  openCreateModal() {
    this.errorMessage.set(null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isSubmitting.set(false);
  }

  onSaveDraft(data: ConfigurationFormData) {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.configurationsService.createDraft(data.key, data.value).pipe(
      finalize(() => this.isSubmitting.set(false)),
      catchError((error) => {
        // En un componente real mostraríamos el error 422 asociando a campos, 
        // pero por ahora lo dejamos recuperable 
        console.error(error);
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.closeModal();
        // Invalida y recarga listado
        this.loadConfigurations();
      }
    });
  }
}
