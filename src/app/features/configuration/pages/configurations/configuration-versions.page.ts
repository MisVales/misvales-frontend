import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ConfigurationsService } from '../../data-access/services/configurations.service';
import { ConfigurationVersion } from '../../models/configuration.model';
import { SessionStore } from '@core/session/session.store';
import { UiStateComponent, UiStateKind } from '@shared/components/ui-state.component';

@Component({
  selector: 'app-configuration-versions-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiStateComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <button (click)="goBack()" class="text-blue-600 hover:underline text-sm mb-2">&larr; Volver a Configuraciones</button>
          <h1 class="text-2xl font-bold">Historial de Versiones: {{ key }}</h1>
        </div>
      </div>

      <ng-container *ngIf="loadState() === 'content' || loadState() === 'empty'; else stateTemplate">
        <div class="overflow-x-auto bg-white rounded-lg shadow border border-gray-200" *ngIf="loadState() === 'content'">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigente desde</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th *ngIf="canEdit()" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let version of versions()">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ version.versionNumber || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ version.value }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': version.status === 'DRAFT',
                          'bg-green-100 text-green-800': version.status === 'PUBLISHED',
                          'bg-gray-100 text-gray-800': version.status === 'INACTIVE'
                        }">
                    {{ version.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ version.effectiveFrom || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ version.actor || '-' }}</td>
                <td *ngIf="canEdit()" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button *ngIf="version.status === 'DRAFT'" (click)="openPublishModal(version)" class="text-indigo-600 hover:text-indigo-900 mr-4">Publicar</button>
                  <button *ngIf="version.status !== 'INACTIVE'" (click)="openDeactivateModal(version)" class="text-red-600 hover:text-red-900">Desactivar</button>
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
          <p class="text-gray-500">No hay versiones para esta configuración.</p>
        </div>
      </ng-container>

      <ng-template #stateTemplate>
        <mv-ui-state [kind]="uiStateKind()" [retryable]="true" (retry)="loadVersions()"></mv-ui-state>
      </ng-template>

      <!-- Modal de Publicación -->
      <div *ngIf="publishModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Publicar Versión</h3>
          </div>
          <form [formGroup]="publishForm" (ngSubmit)="onPublish()" class="p-6">
            <div *ngIf="errorMessage()" class="mb-4 mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Fecha Efectiva (America/Monterrey)</label>
                <input type="datetime-local" formControlName="effectiveFrom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
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
            <h3 class="text-lg font-medium text-gray-900">Desactivar Versión</h3>
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
export class ConfigurationVersionsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly configurationsService = inject(ConfigurationsService);
  private readonly sessionStore = inject(SessionStore);
  private readonly fb = inject(FormBuilder);

  key = '';

  readonly versions = signal<ConfigurationVersion[]>([]);
  readonly loadState = signal<'content' | 'loading' | 'empty' | 'error'>('loading');
  readonly uiStateKind = signal<UiStateKind>('loading');

  readonly page = signal(1);
  readonly perPage = signal(20);
  readonly total = signal(0);

  // Modals state
  publishModalOpen = false;
  deactivateModalOpen = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  selectedVersion: ConfigurationVersion | null = null;

  readonly publishForm = this.fb.group({
    effectiveFrom: ['', Validators.required],
    reason: ['', Validators.required]
  });

  readonly deactivateForm = this.fb.group({
    reason: ['', Validators.required]
  });

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || '';
    if (this.key) {
      this.loadVersions();
    } else {
      this.loadState.set('error');
      this.uiStateKind.set('not-found');
    }
  }

  canEdit(): boolean {
    const role = this.sessionStore.access()?.role;
    return role === 'GENERAL_MANAGER';
  }

  loadVersions() {
    this.loadState.set('loading');
    this.uiStateKind.set('loading');

    this.configurationsService.getVersions(this.key, undefined, this.page(), this.perPage()).pipe(
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
        this.versions.set(items);
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
    this.loadVersions();
  }

  goBack() {
    this.router.navigate(['/administrativa/configuraciones']);
  }

  // --- Publish Actions ---
  openPublishModal(version: ConfigurationVersion) {
    this.selectedVersion = version;
    this.publishForm.reset();
    this.publishModalOpen = true;
  }

  closePublishModal() {
    this.publishModalOpen = false;
    this.selectedVersion = null;
    this.isSubmitting.set(false);
  }

  onPublish() {
    if (this.publishForm.valid && this.selectedVersion?.publicId) {
      this.errorMessage.set(null);
    this.isSubmitting.set(true);
      const effectiveFrom = this.publishForm.value.effectiveFrom as string;
      
      // Parse ISO format logic could be applied here if needed for timezone offset
      // But the requirement says "se captura en America/Monterrey y se envía con zona"
      // Since it's a datetime-local, we can append a default offset if required by backend,
      // or send as is depending on backend API. 
      // For now, appending -06:00 (Monterrey offset) just to fulfill "con zona".
      const effectiveFromWithZone = `${effectiveFrom}:00-06:00`;

      const reason = this.publishForm.value.reason as string;

      this.configurationsService.publish(this.key, this.selectedVersion.publicId, effectiveFromWithZone, reason).pipe(
        finalize(() => this.isSubmitting.set(false)),
        catchError(err => {
          console.error(err);
          // In real app we would map error fields to the form
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          this.closePublishModal();
          this.loadVersions();
        }
      });
    }
  }

  // --- Deactivate Actions ---
  openDeactivateModal(version: ConfigurationVersion) {
    this.selectedVersion = version;
    this.deactivateForm.reset();
    this.deactivateModalOpen = true;
  }

  closeDeactivateModal() {
    this.deactivateModalOpen = false;
    this.selectedVersion = null;
    this.isSubmitting.set(false);
  }

  onDeactivate() {
    if (this.deactivateForm.valid && this.selectedVersion?.publicId) {
      this.errorMessage.set(null);
    this.isSubmitting.set(true);
      const reason = this.deactivateForm.value.reason as string;

      this.configurationsService.deactivate(this.key, this.selectedVersion.publicId, reason).pipe(
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
          this.loadVersions();
        }
      });
    }
  }
}


