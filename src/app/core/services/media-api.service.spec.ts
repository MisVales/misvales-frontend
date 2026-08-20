import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MediaApiService } from './media-api.service';
import { API_CONFIG } from '../api/api.config';

describe('MediaApiService', () => {
  let service: MediaApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaApiService, { provide: API_CONFIG, useValue: { baseUrl: 'https://api.example.test/api/v1' } }],
    });
    service = TestBed.inject(MediaApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía una llave idempotente al subir un archivo', () => {
    const file = new File(['evidencia'], 'identificacion.pdf', { type: 'application/pdf' });
    service.upload({ file, owner_type: 'distributor_application', owner_id: 'a1', purpose: 'IDENTIFICATION' }).subscribe();

    const request = http.expectOne('https://api.example.test/api/v1/media');
    expect(request.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/i);
    request.flush({ data: { id: 'm1' } });
  });
});
