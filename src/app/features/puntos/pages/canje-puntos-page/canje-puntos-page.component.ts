import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PointRedemptionRequestItem, PointsBalanceSummary, PuntosApiService } from '../../data-access/puntos-api.service';

@Component({
  selector: 'app-canje-puntos-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './canje-puntos-page.component.html',
  styleUrl: './canje-puntos-page.component.css',
})
export class CanjePuntosPageComponent {
  protected readonly Math = Math;
  private readonly api = inject(PuntosApiService);

  readonly balance = signal<PointsBalanceSummary | null>(null);
  readonly redemptions = signal<PointRedemptionRequestItem[]>([]);
  readonly requestedPoints = signal<number>(0);
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  // Modals state
  readonly rejectModalOpen = signal<PointRedemptionRequestItem | null>(null);
  readonly rejectionReason = signal<string>('');
  readonly deliverModalOpen = signal<PointRedemptionRequestItem | null>(null);
  readonly deliveryNotes = signal<string>('');

  readonly projectedCashAmount = computed(() => {
    const pts = this.requestedPoints();
    const val = parseFloat(this.balance()?.point_value ?? '2.0000');
    if (pts <= 0 || isNaN(pts)) {
      return 0;
    }

    return pts * val;
  });

  readonly filteredRedemptions = computed(() => {
    const list = this.redemptions();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return list.filter((item) => {
      const matchSearch =
        !search ||
        (item.distribuidora?.usuario?.name && item.distribuidora.usuario.name.toLowerCase().includes(search)) ||
        (item.distribuidora?.distributor_number && item.distribuidora.distributor_number.toLowerCase().includes(search));

      const matchStatus = !status || item.status === status;

      return matchSearch && matchStatus;
    });
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.api.getBalance().subscribe({
      next: (b) => this.balance.set(b),
      error: () => this.errorMessage.set('No fue posible obtener el saldo de puntos.'),
    });

    this.api.getRedemptions({ per_page: 50 }).subscribe({
      next: (items) => this.redemptions.set(items),
      error: () => this.errorMessage.set('No fue posible consultar el historial de canjes.'),
    });
  }

  submitRedemption(): void {
    const pts = this.requestedPoints();
    if (pts <= 0) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.requestRedemption(pts).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Solicitud de canje por ${created.points} puntos registrada con éxito.`);
        this.requestedPoints.set(0);
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message ?? 'No fue posible registrar la solicitud de canje.';
        this.errorMessage.set(msg);
      },
    });
  }

  authorize(id: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.authorizeRedemption(id).subscribe({
      next: () => {
        this.successMessage.set('Solicitud de canje autorizada exitosamente.');
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'No fue posible autorizar la solicitud.');
      },
    });
  }

  openRejectModal(item: PointRedemptionRequestItem): void {
    this.rejectionReason.set('');
    this.rejectModalOpen.set(item);
  }

  confirmReject(): void {
    const target = this.rejectModalOpen();
    const reason = this.rejectionReason().trim();
    if (!target || !reason) {
      return;
    }

    this.api.rejectRedemption(target.id, reason).subscribe({
      next: () => {
        this.successMessage.set('Solicitud rechazada y puntos liberados con éxito.');
        this.closeModals();
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'No fue posible rechazar la solicitud.');
      },
    });
  }

  openDeliverModal(item: PointRedemptionRequestItem): void {
    this.deliveryNotes.set('');
    this.deliverModalOpen.set(item);
  }

  confirmDeliver(): void {
    const target = this.deliverModalOpen();
    if (!target) {
      return;
    }

    this.api.deliverRedemption(target.id, this.deliveryNotes().trim() || undefined).subscribe({
      next: () => {
        this.successMessage.set('Entrega de dinero registrada y canje completado con éxito.');
        this.closeModals();
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'No fue posible registrar la entrega.');
      },
    });
  }

  closeModals(): void {
    this.rejectModalOpen.set(null);
    this.deliverModalOpen.set(null);
    this.rejectionReason.set('');
    this.deliveryNotes.set('');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'REQUESTED':
        return 'Solicitado';
      case 'AUTHORIZED':
        return 'Autorizado';
      case 'DELIVERED':
        return 'Entregado';
      case 'REJECTED':
        return 'Rechazado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
