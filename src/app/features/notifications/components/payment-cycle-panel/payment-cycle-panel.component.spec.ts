import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
  CentroOperacionApiService,
  CurrentCutoffSummary,
} from '../../centro-operacion-api.service';
import { PaymentCyclePanelComponent } from './payment-cycle-panel.component';

describe('PaymentCyclePanelComponent', () => {
  it('allows the next cutoff after the deadline expires even if reconciliation is pending', () => {
    const summary: CurrentCutoffSummary = {
      has_open_cutoff: true,
      period: { start: null, projected_end: '2026-10-14T23:59:59Z' },
      projected_status: 'OPEN',
      summary: { distributors: 0, operations: 0, total: 0 },
      payment_period: {
        process_run_id: 'run-1',
        cutoff_at: '2026-08-25T23:59:59Z',
        payment_deadline_at: '2026-09-14T23:59:59Z',
        relations: 1,
        summary: { distributors: 1, operations: 2, total: 3291 },
        status: 'EXPIRED',
        evaluated_at: null,
        overdue_evaluation_at: '2026-09-15T23:59:59Z',
        outcomes: null,
      },
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CentroOperacionApiService,
          useValue: {
            getCurrentCutoffSummary: vi.fn(() => of(summary)),
            forceCutoff: vi.fn(),
            forcePaymentDeadline: vi.fn(),
          },
        },
      ],
    });

    const component = TestBed.createComponent(PaymentCyclePanelComponent).componentInstance;

    expect(component.action()).toBe('CUTOFF');
    expect(component.actionLabel()).toBe('Forzar fecha de corte');
  });

  it('informs when a cutoff has no pending relations to generate', () => {
    const summary: CurrentCutoffSummary = {
      has_open_cutoff: false,
      period: { start: null, projected_end: '2026-10-25T18:05:00Z' },
      projected_status: 'CLOSED',
      summary: { distributors: 0, operations: 0, total: 0 },
      payment_period: null,
    };
    const forceCutoff = vi.fn(() =>
      of({
        success: true,
        process_run_id: 'run-3',
        projected_status: 'CLOSED',
        simulated_cutoff_at: '2026-10-25T18:05:00Z',
        payment_deadline_at: '2026-11-15T05:59:59Z',
        relations_generated: 0,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CentroOperacionApiService,
          useValue: {
            getCurrentCutoffSummary: vi.fn(() => of(summary)),
            forceCutoff,
            forcePaymentDeadline: vi.fn(),
          },
        },
      ],
    });

    const component = TestBed.createComponent(PaymentCyclePanelComponent).componentInstance;
    component.execute();

    expect(forceCutoff).toHaveBeenCalledOnce();
    expect(component.notice()).toBe('No hay relaciones pendientes para generar en este corte.');
    expect(component.processing()).toBe(false);
  });
});
