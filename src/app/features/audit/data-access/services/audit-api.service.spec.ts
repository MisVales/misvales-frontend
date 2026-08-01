import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { AuditApiService } from './audit-api.service';

describe('AuditApiService', () => {
  let api: AuditApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(AuditApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses only unambiguous published audit filters', async () => {
    const promise = firstValueFrom(
      api.events({
        branch_id: 'branch-id',
        requester_user_id: '',
        subject_public_number: 'PUBLIC-001',
        correlation_id: 'correlation-id',
        date_from: '2026-08-01',
        date_to: '2026-08-02',
        per_page: 25,
      }),
    );
    const request = http.expectOne((candidate) => candidate.url === '/api/v1/audit/events');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys().sort()).toEqual([
      'branch_id',
      'correlation_id',
      'date_from',
      'date_to',
      'per_page',
      'subject_public_number',
    ]);
    expect(request.request.params.has('page')).toBe(false);
    expect(request.request.params.has('event_code')).toBe(false);
    expect(request.request.params.has('category')).toBe(false);
    expect(request.request.params.has('result')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
    request.flush(collectionResponse());
    await promise;
  });

  it('loads an immutable event detail by opaque identifier', async () => {
    const promise = firstValueFrom(api.event('event/id'));
    const request = http.expectOne('/api/v1/audit/events/event%2Fid');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ data: {} });
    await promise;
  });
});

function collectionResponse() {
  return {
    data: [],
    links: { prev: null, next: null },
    meta: { current_page: 1, per_page: 25, total: 0 },
  };
}
