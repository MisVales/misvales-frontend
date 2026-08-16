import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../core/session/session.store';
import { ClientesApiService } from '../clientes/data-access/api/clientes-api.service';
import { TransferenciasApiService } from './transferencias-api.service';
import { TransferenciasPageComponent } from './transferencias-page.component';

describe('TransferenciasPageComponent', () => {
  const transfer = {
    id: 'transfer-1',
    client_id: 'client-1',
    origin_distributor_id: 'origin-1',
    destination_distributor_id: 'destination-1',
    origin_branch_id: 'branch-1',
    destination_branch_id: 'branch-2',
    status: 'PREACCEPTED',
    initiated_by: 'distributor-1',
    preaccepted_by: 'distributor-2',
    origin_decided_by: null,
    completed_by: null,
    origin_decision_reason: null,
  };

  const api = {
    transfers: vi.fn(() => of([transfer])),
    history: vi.fn(() => of([])),
    originDecision: vi.fn(() => of(transfer)),
    cancel: vi.fn(() => of({ ...transfer, status: 'CANCELLED' })),
    destinations: vi.fn(() => of([])),
  };
  const clientsApi = { listar: vi.fn(() => of({ data: [], total: 0 })) };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: TransferenciasApiService, useValue: api },
        { provide: ClientesApiService, useValue: clientsApi },
      ],
    });
  });

  it('permite al coordinador capturar el motivo obligatorio y decidir la salida', () => {
    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'coordinator-1', name: 'Coordinación', email: 'coordinator@example.test' },
      ['coordinator'],
      ['client_transfers.view', 'client_transfers.decide_assigned'],
      'branch-1',
    );

    const fixture = TestBed.createComponent(TransferenciasPageComponent);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea[placeholder="Explique por qué autoriza o rechaza la salida"]',
    ) as HTMLTextAreaElement | null;
    expect(textarea).not.toBeNull();
    const authorizeButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Autorizar salida'));
    expect(authorizeButton?.disabled).toBe(true);

    textarea!.value = 'Expediente validado';
    textarea!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(authorizeButton?.disabled).toBe(false);
    fixture.componentInstance.originDecision(transfer, true);

    expect(api.originDecision).toHaveBeenCalledWith(transfer.id, true, 'Expediente validado');
  });

  it('no envía una decisión sin motivo', () => {
    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'coordinator-1', name: 'Coordinación', email: 'coordinator@example.test' },
      ['coordinator'],
      ['client_transfers.view', 'client_transfers.decide_assigned'],
      'branch-1',
    );

    const fixture = TestBed.createComponent(TransferenciasPageComponent);
    fixture.componentInstance.originDecision(transfer, false);

    expect(api.originDecision).not.toHaveBeenCalled();
  });

  it('permite cancelar sólo al actor que inició la transferencia y exige motivo', () => {
    const ownTransfer = { ...transfer, initiated_by: 'distributor-1', status: 'REQUESTED' };
    api.transfers.mockReturnValueOnce(of([ownTransfer]));
    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'distributor-1', name: 'Distribuidora', email: 'distributor@example.test' },
      ['distributor'],
      ['client_transfers.view', 'client_transfers.initiate_own'],
      'branch-1',
    );

    const fixture = TestBed.createComponent(TransferenciasPageComponent);
    fixture.detectChanges();
    const cancelButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Cancelar transferencia'));
    expect(cancelButton?.disabled).toBe(true);

    const textarea = fixture.nativeElement.querySelector(
      'textarea[placeholder="Explique por qué se cancela la transferencia"]',
    ) as HTMLTextAreaElement;
    textarea.value = '  El cliente desistió  ';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cancelButton?.disabled).toBe(false);

    fixture.componentInstance.cancel(ownTransfer);
    expect(api.cancel).toHaveBeenCalledWith(ownTransfer.id, 'El cliente desistió');
    expect(clientsApi.listar).toHaveBeenCalledWith({ search: '', page: 1, perPage: 20 });
    expect(api.destinations).toHaveBeenCalledOnce();
  });
});
