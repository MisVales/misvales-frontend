import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '../../core/session/session.store';
import {
  DelinquencyBlockItem,
  DelinquencyStatus,
  RelationDetail,
  Removal,
  RiesgoApiService,
  RiskAlert,
} from './riesgo-api.service';
import { RelationDetailsDialogComponent } from './relation-details-dialog.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-riesgo-page',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RelationDetailsDialogComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './riesgo-page.component.html',
  styleUrl: './riesgo-page.component.css',
})
export class RiesgoPageComponent {
  private readonly api = inject(RiesgoApiService);
  private readonly session = inject(SessionStore);

  readonly alerts = signal<RiskAlert[]>([]);
  readonly blocks = signal<DelinquencyBlockItem[]>([]);
  readonly removals = signal<Removal[]>([]);
  readonly status = signal<DelinquencyStatus | null>(null);

  // Tabs: 'alerts' | 'blocks' | 'removals'
  readonly activeTab = signal<'alerts' | 'blocks' | 'removals'>('alerts');

  // Search and filter
  readonly searchTerm = signal<string>('');
  readonly alertStatusFilter = signal<string>('');
  readonly blockSearchTerm = signal<string>('');

  // Modals state
  readonly dialogOpen = signal<boolean>(false);
  readonly selectedRelations = signal<RelationDetail[]>([]);

  readonly decisionModalOpen = signal<RiskAlert | null>(null);
  readonly selectedDecision = signal<'APPLY' | 'DO_NOT_APPLY'>('APPLY');

  readonly requestRemovalModalOpen = signal<RiskAlert | DelinquencyBlockItem | null>(null);
  readonly directRemoval = signal(false);

  readonly removalDecisionModalOpen = signal<Removal | null>(null);
  readonly selectedRemovalDecision = signal<'AUTHORIZE' | 'REJECT'>('AUTHORIZE');

  readonly decisionReason = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  readonly openAlertsCount = computed(
    () => this.alerts().filter((a) => a.status === 'OPEN').length,
  );
  readonly pendingRemovalsCount = computed(
    () => this.removals().filter((r) => r.status === 'REQUESTED').length,
  );

  readonly filteredAlerts = computed(() => {
    const list = this.alerts();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.alertStatusFilter();

    return list.filter((alert) => {
      const matchSearch =
        !search ||
        (alert.distribuidora?.usuario?.name &&
          alert.distribuidora.usuario.name.toLowerCase().includes(search)) ||
        (alert.distribuidora?.distributor_number &&
          alert.distribuidora.distributor_number.toLowerCase().includes(search)) ||
        (alert.distribuidora?.sucursal?.name &&
          alert.distribuidora.sucursal.name.toLowerCase().includes(search));

      const matchStatus = !status || alert.status === status;

      return matchSearch && matchStatus;
    });
  });

  readonly filteredBlocks = computed(() => {
    const list = this.blocks();
    const search = this.blockSearchTerm().toLowerCase().trim();

    return list.filter((block) => {
      return (
        !search ||
        (block.distribuidora?.usuario?.name &&
          block.distribuidora.usuario.name.toLowerCase().includes(search)) ||
        (block.distribuidora?.distributor_number &&
          block.distribuidora.distributor_number.toLowerCase().includes(search)) ||
        (block.distribuidora?.sucursal?.name &&
          block.distribuidora.sucursal.name.toLowerCase().includes(search))
      );
    });
  });

  constructor() {
    this.load();
  }

  canViewAlerts(): boolean {
    const roles = this.session.roles();
    const perms = this.session.permissions();
    const allowedRoles = ['general_manager', 'admin', 'branch_manager', 'coordinator'];
    const allowedPerms = ['risk.view_assigned', 'risk.view_branch', 'risk.view_global', 'all'];

    return (
      allowedRoles.some((r) => roles.includes(r)) || allowedPerms.some((p) => perms.includes(p))
    );
  }

  canViewBlocks(): boolean {
    return this.canViewAlerts();
  }

  canViewRemovals(): boolean {
    const roles = this.session.roles();
    const perms = this.session.permissions();
    const allowedRoles = ['general_manager', 'admin', 'branch_manager', 'coordinator'];
    const allowedPerms = [
      'delinquency_removal.decide_branch',
      'delinquency_removal.decide_global',
      'delinquency_removal.request_assigned',
      'all',
    ];

    return (
      allowedRoles.some((r) => roles.includes(r)) || allowedPerms.some((p) => perms.includes(p))
    );
  }

  canDecide(): boolean {
    const roles = this.session.roles();
    const perms = this.session.permissions();
    const allowedRoles = ['general_manager', 'admin', 'branch_manager'];
    const allowedPerms = ['delinquency.decide_branch', 'delinquency.decide_global', 'all'];

    return (
      allowedRoles.some((r) => roles.includes(r)) || allowedPerms.some((p) => perms.includes(p))
    );
  }

  canRequestRemoval(): boolean {
    return this.session.roles().includes('distributor');
  }

  canDecideRemoval(): boolean {
    const roles = this.session.roles();
    const perms = this.session.permissions();
    const allowedRoles = ['general_manager', 'admin', 'branch_manager'];
    const allowedPerms = [
      'delinquency_removal.decide_branch',
      'delinquency_removal.decide_global',
      'all',
    ];

    return (
      allowedRoles.some((r) => roles.includes(r)) || allowedPerms.some((p) => perms.includes(p))
    );
  }

  load(): void {
    if (
      this.session.roles().includes('distributor') &&
      this.session.permissions().includes('risk.view_own')
    ) {
      this.api.me().subscribe({
        next: (status) => this.status.set(status),
        error: () => {},
      });
    }

    if (this.canViewAlerts()) {
      this.api.alerts().subscribe({
        next: (alerts) => this.alerts.set(alerts),
        error: () => {},
      });
    }

    if (this.canViewBlocks()) {
      this.api.delinquencyBlocks().subscribe({
        next: (blocks) => this.blocks.set(blocks),
        error: () => {},
      });
    }

    if (this.canViewRemovals()) {
      this.api.removals().subscribe({
        next: (removals) => this.removals.set(removals),
        error: () => {},
      });
    }
  }

  // Alertas
  openDecisionModal(alert: RiskAlert, decision: 'APPLY' | 'DO_NOT_APPLY'): void {
    this.decisionReason.set('');
    this.selectedDecision.set(decision);
    this.decisionModalOpen.set(alert);
  }

  confirmAlertDecision(): void {
    const alert = this.decisionModalOpen();
    const reason = this.decisionReason().trim();
    if (!alert || !reason) {
      return;
    }

    this.isSubmitting.set(true);
    this.api.decide(alert.id, this.selectedDecision(), reason).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
        this.load();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  openRequestRemovalModal(target: RiskAlert | DelinquencyBlockItem): void {
    this.decisionReason.set('');
    this.requestRemovalModalOpen.set(target);
  }

  openRequestRemovalModalFromBlock(block: DelinquencyBlockItem): void {
    this.decisionReason.set('');
    this.directRemoval.set(this.canDecideRemoval());
    this.requestRemovalModalOpen.set(block);
  }

  confirmRequestRemoval(): void {
    const target = this.requestRemovalModalOpen();
    const reason = this.decisionReason().trim();
    if (!target || !reason) {
      return;
    }

    this.isSubmitting.set(true);
    const action = this.directRemoval()
      ? this.api.removeDirectly(target.distributor_id, reason)
      : this.api.requestRemoval(target.distributor_id, reason);
    action.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
        this.load();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  // Retiros
  openRemovalDecisionModal(removal: Removal, decision: 'AUTHORIZE' | 'REJECT'): void {
    this.decisionReason.set('');
    this.selectedRemovalDecision.set(decision);
    this.removalDecisionModalOpen.set(removal);
  }

  confirmRemovalDecision(): void {
    const removal = this.removalDecisionModalOpen();
    const reason = this.decisionReason().trim();
    if (!removal || !reason) {
      return;
    }

    this.isSubmitting.set(true);
    this.api.decideRemoval(removal.id, this.selectedRemovalDecision(), reason).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
        this.load();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  closeModals(): void {
    this.decisionModalOpen.set(null);
    this.requestRemovalModalOpen.set(null);
    this.directRemoval.set(false);
    this.removalDecisionModalOpen.set(null);
    this.decisionReason.set('');
    this.dialogOpen.set(false);
  }

  viewDetails(alert: RiskAlert): void {
    if (alert.relation_details && alert.relation_details.length > 0) {
      this.selectedRelations.set(alert.relation_details);
      this.dialogOpen.set(true);
    }
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  getAlertStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'Alerta Abierta';
      case 'REVIEWED':
        return 'Revisada';
      case 'RESOLVED':
        return 'Resuelta';
      default:
        return status;
    }
  }

  getRemovalStatusLabel(status: string): string {
    switch (status) {
      case 'REQUESTED':
        return 'Pendiente de Autorización';
      case 'AUTHORIZED':
        return 'Retiro Autorizado';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
    }
  }
}
