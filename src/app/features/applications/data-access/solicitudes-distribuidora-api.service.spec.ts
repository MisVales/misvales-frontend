import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SolicitudesDistribuidoraApiService } from './solicitudes-distribuidora-api.service';
import { API_CONFIG } from '../../../core/api/api.config';

describe('SolicitudesDistribuidoraApiService', () => {
  let service: SolicitudesDistribuidoraApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      SolicitudesDistribuidoraApiService,
      { provide: API_CONFIG, useValue: { baseUrl: '/api/v1' } },
    ] });
    service = TestBed.inject(SolicitudesDistribuidoraApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('desenvuelve la raíz data al crear un expediente', () => {
    let result: any;
    service.crearSolicitud({ branch_id: 'b1', coordinator_id: 'u1' }).subscribe(value => result = value);
    const request = http.expectOne('/api/v1/distributor-applications');
    request.flush({ data: { id: 'a1', application_number: 'SOL-1', branch_id: 'b1', coordinator_id: 'u1', status: 'DRAFT', pending_sections: [], lock_version: 0, created_at: '2026-08-11T00:00:00Z', updated_at: '2026-08-11T00:00:00Z' } });
    expect(result.id).toBe('a1');
    expect(result.folio).toBe('SOL-1');
  });

  it('acepta un DELETE 204 de una sección sin intentar mapearlo como expediente', () => {
    let completed = false;
    service.eliminarFamiliar('a1', 'f1', 2).subscribe({ complete: () => completed = true });
    const request = http.expectOne('/api/v1/distributor-applications/a1/family-members/f1');
    expect(request.request.body).toEqual({ lock_version: 2 });
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBe(true);
  });
});
