import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RedemptionPeriodsService } from '../../data-access/services/redemption-periods.service';
import { RedemptionPeriod } from '../../models/redemption-period.model';
import { SessionStore } from '@core/session/session.store';
import { ServerTableComponent, TableColumn, TablePageEvent } from '@shared/tables/server-table.component';
import { UiStateComponent, UiStateKind } from '@shared/components/ui-state.component';
import { RedemptionPeriodFormComponent, RedemptionPeriodFormData } from '../../forms/redemption-period/redemption-period.form';

@Component({
  selector: 'app-redemption-periods-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiStateComponent, RedemptionPeriodFormComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Periodos de Canje</h1>
          <p class="text-gray-600">Catálogo de periodos configurables</p>
        </div>
        <button
          *ngIf="canEdit()"
          (click)="openCreateModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Nuevo Periodo
        </button>
      </div>

      <ng-container *ngIf="loadState() === 'content' || loadState() === 'empty'; else stateTemplate">
        <div class="overflow-x-auto bg-white rounded-lg shadow border border-gray-200" *ngIf="loadState() === 'content'">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th *ngIf="canEdit()" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let period of periods()">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ period.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ period.startsAt }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ period.endsAt }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': period.status === 'DRAFT',
                          'bg-green-100 text-green-800': period.status === 'PUBLISHED',
                          'bg-gray-100 text-gray-800': period.status === 'INACTIVE'
                        }">
                    {{ period.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ period.actor || '-' }}</td>
                <td *ngIf="canEdit()" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button *ngIf="period.status === 'DRAFT'" (click)="openPublishModal(period)" class="text-indigo-600 hover:text-indigo-900 mr-4">Publicar</button>
                  <button *ngIf="period.status !== 'INACTIVE'" (click)="openDeactivateModal(period)" class="text-red-600 hover:text-red-900">Desactivar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
            <button (click)="move(-1)" [disabled]="page() <= 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Anterior
            </button>
            <span class="text-sm text-gray-700">Página {{ page() }}</span>
            <button (click)="move(1)" [disabled]="page() >= lastPage()" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
        <div *ngIf="loadState() === 'empty'" class="text-center py-10 bg-white rounded-lg shadow">
          <p class="text-gray-500">No hay periodos de canje registrados.</p>
        </div>
      </ng-container>

      <ng-template #stateTemplate>
        <mv-ui-state [kind]="uiStateKind()" [retryable]="true" (retry)="loadPeriods()"></mv-ui-state>
      </ng-template>

      <!-- Modal de Creación -->
      <div *ngIf="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Nuevo Periodo de Canje</h3>
          </div>
          <div class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <app-redemption-period-form
              [initialData]="null"
              [isSubmitting]="isSubmitting()"
              (save)="onCreate($event)"
              (cancel)="closeModal()"
            ></app-redemption-period-form>
          </div>
        </div>
      </div>

      <!-- Modal de Publicación -->
      <div *ngIf="publishModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Publicar Periodo</h3>
          </div>
          <form [formGroup]="publishForm" (ngSubmit)="onPublish()" class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <div class="space-y-4">
              <p class="text-sm text-gray-600">Al publicar, se solicitará MFA (Simulado con REAUTH_FRONTEND_001).</p>
              <div>
                <label class="block text-sm font-medium text-gray-700">Motivo (obligatorio)</label>
                <textarea formControlName="reason" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" (click)="closePublishModal()" class="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" [disabled]="publishForm.invalid || isSubmitting()" class="bg-indigo-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {{ isSubmitting() ? 'Publicando...' : 'Publicar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Desactivación -->
      <div *ngIf="deactivateModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Desactivar Periodo</h3>
          </div>
          <form [formGroup]="deactivateForm" (ngSubmit)="onDeactivate()" class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Motivo (obligatorio)</label>
                <textarea formControlName="reason" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" (click)="closeDeactivateModal()" class="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" [disabled]="deactivateForm.invalid || isSubmitting()" class="bg-red-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {{ isSubmitting() ? 'Desactivando...' : 'Desactivar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RedemptionPeriodsPageComponent implements OnInit {
  private readonly periodsService = inject(RedemptionPeriodsService);
  private readonly sessionStore = inject(SessionStore);
  private readonly fb = inject(FormBuilder);

  readonly periods = signal<RedemptionPeriod[]>([]);
  readonly loadState = signal<'content' | 'loading' | 'empty' | 'error'>('loading');
  readonly uiStateKind = signal<UiStateKind>('loading');
  
  readonly page = signal(1);
  readonly perPage = signal(20);
  readonly total = signal(0);

  isModalOpen = false;
  publishModalOpen = false;
  deactivateModalOpen = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  selectedPeriod: RedemptionPeriod | null = null;

  readonly publishForm = this.fb.group({
    reason: ['', Validators.required]
  });

  readonly deactivateForm = this.fb.group({
    reason: ['', Validators.required]
  });

  ngOnInit() {
    this.loadPeriods();
  }

  canEdit(): boolean {
    const role = this.sessionStore.access()?.role;
    return role === 'GENERAL_MANAGER';
  }

  loadPeriods() {
    this.loadState.set('loading');
    this.uiStateKind.set('loading');

    this.periodsService.list(undefined, this.page(), this.perPage()).pipe(
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
        this.periods.set(items);
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

  lastPage(): number {
    return Math.max(1, Math.ceil(this.total() / this.perPage()));
  }

  move(delta: number): void {
    const p = this.page() + delta;
    if (p < 1 || (delta > 0 && p > this.lastPage())) {
      return;
    }
    this.page.set(p);
    this.loadPeriods();
  }

  openCreateModal() {
    this.errorMessage.set(null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isSubmitting.set(false);
  }

  onCreate(data: RedemptionPeriodFormData) {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    
    // Add timezone offset
    const startsAt = `${data.startsAt}:00-06:00`;
    const endsAt = `${data.endsAt}:00-06:00`;

    this.periodsService.create(
      data.name,
      data.description,
      startsAt,
      endsAt,
      data.reason
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
        this.loadPeriods();
      }
    });
  }

  // --- Publish Actions ---
  openPublishModal(period: RedemptionPeriod) {
    this.selectedPeriod = period;
    this.publishForm.reset();
    this.publishModalOpen = true;
  }

  closePublishModal() {
    this.publishModalOpen = false;
    this.selectedPeriod = null;
    this.isSubmitting.set(false);
  }

  onPublish() {
    if (this.publishForm.valid && this.selectedPeriod?.publicId) {
      this.errorMessage.set(null);
    this.isSubmitting.set(true);
      const reason = this.publishForm.value.reason as string;
      const reauthenticationToken = 'REAUTH_FRONTEND_001';

      this.periodsService.publish(this.selectedPeriod.publicId, reauthenticationToken, reason).pipe(
        finalize(() => this.isSubmitting.set(false)),
        catchError(err => {
          console.error(err);
          const msg = err.error?.error?.message || 'Error al procesar la solicitud.';
          this.errorMessage.set(msg);
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          this.closePublishModal();
          this.loadPeriods();
        }
      });
    }
  }

  // --- Deactivate Actions ---
  openDeactivateModal(period: RedemptionPeriod) {
    this.selectedPeriod = period;
    this.deactivateForm.reset();
    this.deactivateModalOpen = true;
  }

  closeDeactivateModal() {
    this.deactivateModalOpen = false;
    this.selectedPeriod = null;
    this.isSubmitting.set(false);
  }

  onDeactivate() {
    if (this.deactivateForm.valid && this.selectedPeriod?.publicId) {
      this.errorMessage.set(null);
    this.isSubmitting.set(true);
      const reason = this.deactivateForm.value.reason as string;

      this.periodsService.deactivate(this.selectedPeriod.publicId, reason).pipe(
        finalize(() => this.isSubmitting.set(false)),
        catchError(err => {
          console.error(err);
          const msg = err.error?.error?.message || 'Error al procesar la solicitud.';
          this.errorMessage.set(msg);
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          this.closeDeactivateModal();
          this.loadPeriods();
        }
      });
    }
  }
}

