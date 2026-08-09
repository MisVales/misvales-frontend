import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DistribuidorasApiService } from './distribuidoras-api.service';

describe('DistribuidorasApiService', () => {
  let service: DistribuidorasApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), DistribuidorasApiService] });
    service = TestBed.inject(DistribuidorasApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('consume únicamente expedientes autorizados y categorías disponibles', async () => {
    const candidatos = firstValueFrom(service.candidatosActivacion());
    http.expectOne('/api/v1/distributor-activation-candidates').flush({ data: [{ id: 's1' }] });
    expect((await candidatos)[0].id).toBe('s1');

    const categorias = firstValueFrom(service.categoriasDisponibles());
    http.expectOne('/api/v1/distributor-categories/available').flush({ data: [{ category_version_id: 'v1' }] });
    expect((await categorias)[0].category_version_id).toBe('v1');
  });

  it('envía categoría e idempotencia al completar el alta', () => {
    service.activarSolicitud('s1', 'v1').subscribe();
    const request = http.expectOne('/api/v1/distributor-applications/s1/activation');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ category_version_id: 'v1' });
    expect(request.request.headers.has('Idempotency-Key')).toBe(true);
    request.flush({ data: {
      id: 'd1', distributor_number: 'DIS-1', full_name: 'Ana', status: 'PENDING_ACTIVATION',
      activation_status: 'PENDING_ACTIVATION', branch: { id: 'b1', name: 'Centro' }, coordinator: null,
      category: null, lock_version: 0
    } });
  });
});
