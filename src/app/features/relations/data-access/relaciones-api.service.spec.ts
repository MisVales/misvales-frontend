import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { RelacionesApiService } from './relaciones-api.service';

describe('RelacionesApiService', () => {
  let service: RelacionesApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RelacionesApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(RelacionesApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('lee la página de relaciones del backend', () => {
    service.list().subscribe((v) => expect(v.data[0].payment_reference).toBe('REL-1'));
    const req = http.expectOne((r) => r.url.endsWith('/relations'));
    req.flush({ data: { data: [{ payment_reference: 'REL-1' }] } });
  });
  it('descarga el documento autorizado como blob', () => {
    service.download('r1').subscribe((v) => expect(v.type).toBe('application/pdf'));
    const req = http.expectOne((r) => r.url.endsWith('/relations/r1/download'));
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['ok'], { type: 'application/pdf' }));
  });
});
