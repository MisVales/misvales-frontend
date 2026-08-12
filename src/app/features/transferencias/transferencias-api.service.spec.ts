import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../core/api/api.config';
import { TransferenciasApiService } from './transferencias-api.service';

describe('TransferenciasApiService', () => {
  let service: TransferenciasApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransferenciasApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(TransferenciasApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('conserva la secuencia explícita de preaceptación y aceptación definitiva', () => {
    service.preaccept('t1', true).subscribe((value) => expect(value.status).toBe('PREACCEPTED'));
    const preaccept = http.expectOne((request) =>
      request.url.endsWith('/client-transfers/t1/preaccept'),
    );
    expect(preaccept.request.body).toEqual({ accept: true });
    preaccept.flush({ data: { status: 'PREACCEPTED' } });
    service.complete('t1').subscribe();
    const complete = http.expectOne((request) =>
      request.url.endsWith('/client-transfers/t1/complete'),
    );
    expect(complete.request.body).toEqual({});
    complete.flush({ data: { status: 'COMPLETED' } });
  });
});
