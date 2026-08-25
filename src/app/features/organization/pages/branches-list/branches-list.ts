import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '@core/session/session.store';
import { BranchStatusBadgeComponent } from '@shared/components/badges/branch-status-badge/branch-status-badge.component';
import {
  RefactorSelectComponent,
  RefactorSelectOption,
} from '@shared/components/inputs/refactor-select/refactor-select.component';
import { RefactorInputComponent } from '@shared/components/inputs/refactor-input/refactor-input.component';
import { ViewStateComponent } from '@shared/components/loading/view-state/view-state.component';
import {
  EmptyStateComponent,
  PageContextHeaderComponent,
} from '@features/verifications/presentation/components/primitives/verification-primitives';
import { BranchMapPreviewComponent } from '../../components/branch-map-preview/branch-map-preview.component';
import { OrganizationFacade } from '../../state/organization.facade';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LucideAngularModule,
    EmptyStateComponent,
    BranchStatusBadgeComponent,
    RefactorInputComponent,
    RefactorSelectComponent,
    ViewStateComponent,
    PageContextHeaderComponent,
    BranchMapPreviewComponent,
  ],
  templateUrl: './branches-list.html',
  styleUrl: './branches-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchesList implements OnInit, OnDestroy {
  readonly facade = inject(OrganizationFacade);
  private readonly sessionStore = inject(SessionStore);

  readonly statusOptions: readonly RefactorSelectOption[] = [
    { value: '', label: 'Todas las sucursales', tone: 'gray' },
    { value: 'ACTIVE', label: 'Activas', tone: 'green' },
    { value: 'INACTIVE', label: 'Inactivas', tone: 'orange' },
  ];

  searchTerm = '';
  statusFilter = '';
  readonly Math = Math;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly isBranchManager = (): boolean =>
    this.sessionStore.roles().includes('branch_manager') &&
    !this.sessionStore.roles().includes('general_manager');

  ngOnInit(): void {
    this.facade.loadBranches();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  }

  canManage(): boolean {
    const permissions = this.sessionStore.permissions();
    return permissions.includes('branches.create') || permissions.includes('all');
  }

  onSearch(debounce = false): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    const load = () => this.facade.loadBranches(1, 10, this.searchTerm.trim(), this.statusFilter);
    if (debounce) this.searchTimeout = setTimeout(load, 300);
    else load();
  }

  changePage(delta: number): void {
    const newPage = this.facade.page() + delta;
    this.facade.loadBranches(
      newPage,
      this.facade.perPage(),
      this.searchTerm.trim(),
      this.statusFilter,
    );
  }
}
