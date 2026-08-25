import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CreditoApiService, CreditIncreaseView } from '../../data-access/credito-api.service';
import { IncrementosLineaPageComponent } from './incrementos-linea-page.component';

describe('IncrementosLineaPageComponent row action', () => {
  it('opens a request from the visible action button', () => {
    const request: CreditIncreaseView = {
      id: 'increase-1',
      request_number: 'INC-001',
      status: 'REQUESTED',
      requested_amount: '1000.00',
      recommended_amount: null,
      authorized_amount: null,
      requested_at: '2026-08-18T00:00:00Z',
      lock_version: 1,
    };
    const api = {
      listarIncrementos: vi.fn(() =>
        of({ data: [request], meta: { current_page: 1, last_page: 1, total: 1 } }),
      ),
      consultarIncremento: vi.fn(() => of(request)),
    };
    TestBed.configureTestingModule({
      imports: [IncrementosLineaPageComponent],
      providers: [{ provide: CreditoApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(IncrementosLineaPageComponent);

    fixture.detectChanges();

    const openButton = fixture.nativeElement.querySelector(
      'tbody button[aria-label="Ver solicitud INC-001"]',
    ) as HTMLButtonElement;
    expect(openButton).toBeTruthy();
    expect(openButton.type).toBe('button');

    openButton.click();

    expect(api.consultarIncremento).toHaveBeenCalledWith('increase-1');
    expect(fixture.componentInstance.selected()?.id).toBe('increase-1');
  });
});
