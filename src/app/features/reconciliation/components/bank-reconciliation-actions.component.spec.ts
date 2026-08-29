import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConciliacionApiService } from '../data-access/conciliacion-api.service';
import { BankReconciliationActionsComponent } from './bank-reconciliation-actions.component';

describe('BankReconciliationActionsComponent', () => {
  const api = {
    pendingPeriods: vi.fn(() => of([])),
    simulatedTransfers: vi.fn(() => of([])),
    exportSimulatedTransfers: vi.fn(),
    upload: vi.fn(),
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    api.pendingPeriods.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [BankReconciliationActionsComponent],
      providers: [{ provide: ConciliacionApiService, useValue: api }],
    });
  });

  it('conserva el XLSX seleccionado sin romper el render', () => {
    const fixture = TestBed.createComponent(BankReconciliationActionsComponent);
    const file = new File(['xlsx'], 'conciliacion.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: { item: () => file } });

    fixture.componentInstance.select('run-1', { target: input } as unknown as Event);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedFileName('run-1')).toBe('conciliacion.xlsx');
  });
});
