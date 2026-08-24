import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../core/api/api.config';
import { RiesgoApiService } from './riesgo-api.service';
describe('RiesgoApiService', () => {
  let s: RiesgoApiService;
  let h: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RiesgoApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    s = TestBed.inject(RiesgoApiService);
    h = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    h.verify();
    TestBed.resetTestingModule();
  });
  it('requiere decisión explícita para aplicar morosidad', () => {
    s.decide('a1', 'APPLY', 'Tres incumplimientos').subscribe((v) =>
      expect(v.status).toBe('REVIEWED'),
    );
    const r = h.expectOne((x) => x.url.endsWith('/risk-alerts/a1/decision'));
    expect(r.request.body).toEqual({ decision: 'APPLY', reason: 'Tres incumplimientos' });
    r.flush({ data: { status: 'REVIEWED' } });
  });
});
