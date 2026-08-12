import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../core/api/api.config';
import { PuntosApiService } from './puntos-api.service';
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
describe('PuntosApiService', () => {
  let s: PuntosApiService;
  let h: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PuntosApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    s = TestBed.inject(PuntosApiService);
    h = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    h.verify();
    TestBed.resetTestingModule();
  });
  it('solicita puntos sin calcular el valor monetario en Angular', () => {
    s.request(10).subscribe((v) => expect(v.monetary_value).toBe('20.0000'));
    const r = h.expectOne((x) => x.url.endsWith('/point-redemption-requests'));
    expect(r.request.body).toEqual({ points: 10 });
    r.flush({ data: { monetary_value: '20.0000' } });
  });
});
