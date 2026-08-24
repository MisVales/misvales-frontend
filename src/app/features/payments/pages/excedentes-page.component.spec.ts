import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import { SessionStore } from '../../../core/session/session.store';
import { ConfirmationService } from '../../../shared/dialogs/confirmation.service';
import { ExcedentesApiService, Surplus } from '../data-access/excedentes-api.service';
import { groupSurpluses } from '../data-access/surplus-group';
import { ExcedentesPageComponent } from './excedentes-page.component';

const pending: Surplus = {
  id: 's1',
  distributor_id: 'd1',
  distributor_name: 'Distribuidora prueba',
  branch_id: 'b1',
  branch_name: 'Centro',
  origin_relation_id: 'r1',
  origin_relation_reference: 'REL-001',
  bank_movement_id: 'm1',
  bank_folio: 'BANK-001',
  original_amount: '700.0000',
  available_amount: '700.0000',
  reserved_amount: '0.0000',
  status: 'PENDING_DECISION',
  applications: [],
  refund_requests: [],
  created_at: '2026-08-21T10:00:00-06:00',
};
const pendingGroup = groupSurpluses([pending])[0];

describe('ExcedentesPageComponent', () => {
  const api = {
    list: vi.fn(() => of([pending])),
    refunds: vi.fn(() => of([])),
    credit: vi.fn(() => of({ ...pending, status: 'CREDIT_BALANCE' })),
    refund: vi.fn(() => of({ id: 'f1', status: 'REQUESTED' })),
    decide: vi.fn(),
    cancel: vi.fn(),
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [ExcedentesPageComponent],
      providers: [
        { provide: ExcedentesApiService, useValue: api },
        { provide: SessionStore, useValue: { permissions: () => ['surpluses.view_own'], roles: () => ['distributor'] } },
        { provide: MediaApiService, useValue: { upload: vi.fn(), download: vi.fn() } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn(async () => true) } },
      ],
    });
  });

  it('muestra las dos decisiones solo mientras el excedente está pendiente', async () => {
    const fixture = TestBed.createComponent(ExcedentesPageComponent);
    await fixture.whenStable();
    fixture.componentInstance.open(pendingGroup);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Conservar como saldo a favor');
    expect(fixture.nativeElement.textContent).toContain('Solicitar devolución');

    fixture.componentInstance.selected.set({
      ...pendingGroup,
      status: 'REFUND_PENDING',
      available_amount: '0.0000',
      reserved_amount: '700.0000',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Conservar como saldo a favor');
    expect(fixture.nativeElement.textContent).not.toContain('Solicitar devolución');
  });

  it('traduce los estados financieros y de devolución para la interfaz', () => {
    const component = TestBed.createComponent(ExcedentesPageComponent).componentInstance;
    expect(component.statusLabel('PARTIALLY_APPLIED')).toBe('Aplicado parcialmente');
    expect(component.statusLabel('AUTHORIZED')).toBe('Autorizada');
    expect(component.statusLabel('EXECUTED')).toBe('Devuelta');
  });
});
