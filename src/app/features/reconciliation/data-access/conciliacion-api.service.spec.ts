import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { ConciliacionApiService } from './conciliacion-api.service';
describe('ConciliacionApiService', () => {
  let service: ConciliacionApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConciliacionApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(ConciliacionApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('carga el XLSX como multipart sin inventar integración bancaria', () => {
    const file = new File(['xlsx'], 'bank.xlsx');
    service.upload(file, 'run-1').subscribe((v) => expect(v.status).toBe('PROCESSED'));
    const req = http.expectOne((r) => r.url.endsWith('/bank-imports'));
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBe(file);
    expect((req.request.body as FormData).get('process_run_id')).toBe('run-1');
    req.flush({ data: { status: 'PROCESSED' } });
  });
  it('consulta movimientos conciliados paginados', () => {
    service.movements().subscribe((items) => expect(items[0].classification).toBe('SETTLEMENT'));
    const req = http.expectOne((request) => request.url.endsWith('/bank-movements'));
    req.flush({ data: [{ id: 'm1', classification: 'SETTLEMENT' }] });
  });

  it('guarda y descarga los movimientos bancarios simulados', () => {
    service
      .simulateTransfer({
        relation_id: 'r1',
        amount: 1000,
        payment_type: 'TRANSFER',
      })
      .subscribe((item) => expect(item.payment_reference).toBe('REL-1'));
    const create = http.expectOne((request) => request.url.endsWith('/bank-simulations'));
    expect(create.request.method).toBe('POST');
    create.flush({ data: { id: 's1', payment_reference: 'REL-1' } });

    service.exportSimulatedTransfers('run-1').subscribe((file) => expect(file.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    const download = http.expectOne((request) => request.url.endsWith('/bank-simulations/export'));
    expect(download.request.responseType).toBe('blob');
    expect(download.request.params.get('process_run_id')).toBe('run-1');
    download.flush(new Blob(['xlsx'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

    service.simulationTicket('s1').subscribe((file) => expect(file.type).toBe('application/pdf'));
    const ticket = http.expectOne((request) => request.url.endsWith('/bank-simulations/s1/ticket'));
    expect(ticket.request.responseType).toBe('blob');
    ticket.flush(new Blob(['pdf'], { type: 'application/pdf' }));
  });

  it('envía los filtros de resultado y estado al backend', () => {
    service
      .movements({ result: 'UNRECONCILED', status: 'MANUAL_REQUESTED', search: 'folio' })
      .subscribe();
    const req = http.expectOne((request) => request.url.endsWith('/bank-movements'));
    expect(req.request.params.get('result')).toBe('UNRECONCILED');
    expect(req.request.params.get('status')).toBe('MANUAL_REQUESTED');
    expect(req.request.params.get('search')).toBe('folio');
    req.flush({ data: [] });
  });

  it('solicita y ejecuta la conciliación manual en endpoints separados', () => {
    service.requestManual('m1', 'r1', 'c1', 'Comprobante validado').subscribe();
    const request = http.expectOne((value) =>
      value.url.endsWith('/bank-movements/m1/manual-reconciliation-requests'),
    );
    expect(request.request.body).toEqual({
      relation_id: 'r1',
      clarification_id: 'c1',
      reason: 'Comprobante validado',
    });
    request.flush({ data: { id: 's1', status: 'REQUESTED' } });

    service.executeManual('s1').subscribe();
    const execute = http.expectOne((value) =>
      value.url.endsWith('/manual-reconciliation-requests/s1/execute'),
    );
    expect(execute.request.method).toBe('POST');
    execute.flush({ data: { id: 's1', status: 'EXECUTED' } });
  });
});
