import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import {
  CentroOperacionApiService,
  CurrentCutoffSummary,
  ForceCutoffResponse,
  ForcePaymentDeadlineResponse,
} from '../../centro-operacion-api.service';

type CycleAction = 'CUTOFF' | 'DEADLINE' | 'EXPIRE';

@Component({
  selector: 'app-payment-cycle-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './payment-cycle-panel.component.html',
  styleUrl: './payment-cycle-panel.component.css',
})
export class PaymentCyclePanelComponent {
  private readonly api = inject(CentroOperacionApiService);

  readonly summary = signal<CurrentCutoffSummary | null>(null);
  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly error = signal('');
  readonly result = signal<ForcePaymentDeadlineResponse | null>(null);
  readonly modalOpen = signal(false);
  motivo = '';

  constructor() {
    this.load();
  }

  action(): CycleAction {
    const period = this.summary()?.payment_period;
    if (!period || period.status === 'COMPLETED') return 'CUTOFF';
    if (period.status === 'DEADLINE_REACHED' || period.status === 'EXPIRED') return 'EXPIRE';
    return 'DEADLINE';
  }

  actionLabel(): string {
    if (this.processing()) return 'Procesando…';
    if (this.loading()) return 'Consultando estado…';
    if (!this.summary()) return 'Reintentar';
    return {
      CUTOFF: 'Forzar fecha de corte',
      DEADLINE: 'Forzar fecha límite de pago',
      EXPIRE: 'Vencer fecha límite de pago',
    }[this.action()];
  }

  openConfirmation(): void {
    this.motivo = '';
    this.error.set('');
    this.modalOpen.set(true);
  }

  primaryAction(): void {
    if (!this.summary()) {
      this.load();
      return;
    }

    this.openConfirmation();
  }

  closeConfirmation(): void {
    if (!this.processing()) this.modalOpen.set(false);
  }

  execute(): void {
    this.processing.set(true);
    this.error.set('');
    const request: Observable<ForceCutoffResponse | ForcePaymentDeadlineResponse> =
      this.action() === 'CUTOFF'
        ? this.api.forceCutoff(this.motivo, crypto.randomUUID())
        : this.api.forcePaymentDeadline(this.motivo, crypto.randomUUID());

    request.subscribe({
      next: (response) => {
        if ('status' in response) this.result.set(response);
        this.modalOpen.set(false);
        this.processing.set(false);
        this.load();
      },
      error: (error) => {
        this.processing.set(false);
        this.error.set(error.error?.message || 'No fue posible avanzar el ciclo de pago.');
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getCurrentCutoffSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No fue posible cargar el estado actual del ciclo de pago.');
      },
    });
  }
}
