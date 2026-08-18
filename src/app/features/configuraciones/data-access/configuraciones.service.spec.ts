import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { ConfiguracionesService } from './configuraciones.service';

describe('ConfiguracionesService', () => {
  let service: ConfiguracionesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfiguracionesService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(ConfiguracionesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('desenvuelve la colección real de JsonResource', () => {
    let result: unknown[] = [];
    service.listar().subscribe((value) => (result = value));
    http.expectOne('/api/v1/configurations').flush({ data: [{ id: 'd1', key: 'CUT_DAY_OF_MONTH' }] });
    expect(result).toEqual([{ id: 'd1', key: 'CUT_DAY_OF_MONTH' }]);
  });

  it('no expone la configuración interna de días posteriores al corte', () => {
    let result: unknown[] = [];
    service.listar().subscribe((value) => (result = value));
    http.expectOne('/api/v1/configurations').flush({
      data: [
        { id: 'd1', key: 'CUT_DAY_OF_MONTH' },
        { id: 'd2', key: 'PAYMENT_DAYS_AFTER_CUT' },
      ],
    });
    expect(result).toEqual([{ id: 'd1', key: 'CUT_DAY_OF_MONTH' }]);
  });

  it('envía lock_version en cuerpo y cabecera al publicar', () => {
    service.publicarVersion('v1', 3, 'Motivo operativo').subscribe();
    const request = http.expectOne('/api/v1/configuration-versions/v1/publish');
    expect(request.request.body).toEqual({ reason: 'Motivo operativo', lock_version: 3 });
    expect(request.request.headers.get('If-Match')).toBe('3');
    expect(request.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/i);
    request.flush({ data: { id: 'v1' } });
  });

  it('envía lock_version en cuerpo y cabecera al desactivar', () => {
    service.desactivarVersion('v1', 4, 'Retiro controlado').subscribe();
    const request = http.expectOne('/api/v1/configuration-versions/v1/deactivate');
    expect(request.request.body).toEqual({ reason: 'Retiro controlado', lock_version: 4 });
    expect(request.request.headers.get('If-Match')).toBe('4');
    request.flush({ data: { id: 'v1' } });
  });
});
