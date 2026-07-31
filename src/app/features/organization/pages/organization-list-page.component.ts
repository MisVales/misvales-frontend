import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { OrganizationApiService } from '../data-access/organization-api.service';
import { OrganizationRecord, OrganizationResource } from '../models/organization.models';

@Component({
  selector: 'mv-organization-list-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    RouterLink,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel wide">
      <p class="mv-eyebrow">Organización</p>
      <header class="heading">
        <h1>{{ title }}</h1>
        @if (createRoute) {
          <a [routerLink]="createRoute">{{ createLabel }}</a>
        }
      </header>
      @if (resource === 'users') {
        <form class="search" (submit)="search($event)">
          <label for="organization-search">Buscar usuarios</label>
          <input id="organization-search" type="search" [formControl]="searchControl" />
          <mv-action-button buttonType="submit">Buscar</mv-action-button>
        </form>
      }
      @if (message()) {
        <mv-feedback-message kind="error" [message]="message()!" />
      }
      @if (loading()) {
        <mv-ui-state kind="loading" message="Consultando información…" />
      } @else if (records().length === 0) {
        <mv-ui-state kind="empty" message="No hay registros dentro de tu alcance." />
      } @else {
        <div class="records">
          @for (record of records(); track record.id) {
            <article>
              <div>
                <h2>{{ record.title }}</h2>
                <p>{{ record.subtitle }}</p>
                <small>{{ record.status }}</small>
              </div>
              @if (hasDetail) {
                <a [routerLink]="record.id">Ver detalle</a>
              }
            </article>
          }
        </div>
        <nav class="pagination" aria-label="Paginación">
          <button type="button" [disabled]="!previousUrl() && page() <= 1" (click)="move(-1)">
            Anterior
          </button>
          <span>Página {{ page() }}</span>
          <button type="button" [disabled]="!nextUrl()" (click)="move(1)">Siguiente</button>
        </nav>
      }

      @if (resource === 'roles') {
        <section class="catalog" aria-labelledby="permissions-title">
          <h2 id="permissions-title">Catálogo de permisos</h2>
          @if (permissionsLoading()) {
            <mv-ui-state kind="loading" message="Consultando permisos…" />
          } @else if (permissionsMessage()) {
            <mv-feedback-message kind="error" [message]="permissionsMessage()!" />
          } @else if (permissions().length === 0) {
            <mv-ui-state kind="empty" message="No hay permisos dentro de tu alcance." />
          } @else {
            <div class="records">
              @for (permission of permissions(); track permission.id) {
                <article>
                  <div>
                    <h3>{{ permission.title }}</h3>
                    <p>{{ permission.subtitle }}</p>
                  </div>
                </article>
              }
            </div>
            <nav class="pagination" aria-label="Paginación de permisos">
              <button
                type="button"
                [disabled]="!permissionsPreviousUrl()"
                (click)="movePermissions(-1)"
              >
                Anterior
              </button>
              <span>Página {{ permissionsPage() }}</span>
              <button type="button" [disabled]="!permissionsNextUrl()" (click)="movePermissions(1)">
                Siguiente
              </button>
            </nav>
          }
        </section>
      }
    </section>
  `,
  styles: `
    .wide {
      width: min(100%, 64rem);
    }
    .heading,
    .search,
    article,
    .pagination {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
    }
    .search {
      flex-wrap: wrap;
    }
    .search input {
      min-height: 44px;
      flex: 1 1 14rem;
    }
    .records {
      display: grid;
      gap: 0.7rem;
    }
    article {
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 0.9rem;
    }
    article h2 {
      font-size: 1rem;
    }
    .catalog {
      display: grid;
      gap: 1rem;
      border-top: 1px solid var(--mv-gray);
      padding-top: 1rem;
    }
    .catalog h3 {
      font-size: 1rem;
    }
    button,
    a {
      min-height: 44px;
      padding: 0.65rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationListPageComponent {
  private readonly api = inject(OrganizationApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionStore);
  readonly resource = this.route.snapshot.data['resource'] as OrganizationResource;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly hasDetail = ['assignments', 'branches', 'roles', 'users'].includes(this.resource);
  readonly createRoute =
    this.resource === 'assignments'
      ? '/administrativa/organizacion/asignaciones/nueva'
      : this.resource === 'scopes'
        ? '/administrativa/organizacion/alcances/nuevo'
        : this.resource === 'users' && this.session.hasPermission('accounts.global.create')
          ? '/administrativa/cuentas/nueva'
          : null;
  readonly createLabel =
    this.resource === 'scopes'
      ? 'Nuevo alcance'
      : this.resource === 'users'
        ? 'Nueva cuenta'
        : 'Nueva asignación';
  readonly records = signal<readonly OrganizationRecord[]>([]);
  readonly page = signal(1);
  readonly previousUrl = signal<string | null>(null);
  readonly nextUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly message = signal<string | null>(null);
  readonly permissions = signal<readonly OrganizationRecord[]>([]);
  readonly permissionsPage = signal(1);
  readonly permissionsPreviousUrl = signal<string | null>(null);
  readonly permissionsNextUrl = signal<string | null>(null);
  readonly permissionsLoading = signal(false);
  readonly permissionsMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.load();
    if (this.resource === 'roles') this.loadPermissions();
  }

  search(event: Event): void {
    event.preventDefault();
    this.page.set(1);
    this.load();
  }

  move(delta: number): void {
    if (this.resource === 'users') {
      const page = this.page() + delta;
      if (page < 1 || (delta > 0 && !this.nextUrl())) return;
      this.page.set(page);
      this.load();
      return;
    }
    const target = delta < 0 ? this.previousUrl() : this.nextUrl();
    if (!target) return;
    this.load(target);
  }

  movePermissions(delta: number): void {
    const target = delta < 0 ? this.permissionsPreviousUrl() : this.permissionsNextUrl();
    if (!target) return;
    this.loadPermissions(target);
  }

  private load(navigationUrl: string | null = null): void {
    this.loading.set(true);
    this.message.set(null);
    this.api
      .list(this.resource, this.searchControl.value, this.page(), navigationUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.records.set(response.data);
        this.page.set(response.meta.current_page);
        this.previousUrl.set(response.links.prev);
        this.nextUrl.set(response.links.next);
      });
  }

  private loadPermissions(navigationUrl: string | null = null): void {
    this.permissionsLoading.set(true);
    this.permissionsMessage.set(null);
    this.api
      .list('permissions', '', 1, navigationUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.permissionsLoading.set(false);
          this.permissionsMessage.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.permissionsLoading.set(false);
        this.permissions.set(response.data);
        this.permissionsPage.set(response.meta.current_page);
        this.permissionsPreviousUrl.set(response.links.prev);
        this.permissionsNextUrl.set(response.links.next);
      });
  }
}
