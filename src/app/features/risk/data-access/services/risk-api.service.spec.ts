import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { RiskApiService } from './risk-api.service';

describe('RiskApiService', () => {
  let api: RiskApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(RiskApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the 13 documented risk and delinquency contracts', async () => {
    await expectGet(api.distributors(), '/api/v1/risk/distributors');
    await expectGet(
      api.distributor('distributor/id'),
      '/api/v1/risk/distributors/distributor%2Fid',
    );
    await expectGet(
      api.evaluations('distributor/id'),
      '/api/v1/risk/distributors/distributor%2Fid/evaluations',
    );
    await expectGet(
      api.sequence('distributor/id'),
      '/api/v1/risk/distributors/distributor%2Fid/sequence',
    );
    await expectGet(
      api.alerts('distributor/id'),
      '/api/v1/risk/distributors/distributor%2Fid/alerts',
    );
    await expectGet(api.alert('alert/id'), '/api/v1/risk/alerts/alert%2Fid');
    await expectGet(api.alertReview('alert/id'), '/api/v1/risk/alerts/alert%2Fid/review');
    await expectGet(api.removalRequests(), '/api/v1/delinquency/removal-requests');
    await expectGet(
      api.removalRequest('request/id'),
      '/api/v1/delinquency/removal-requests/request%2Fid',
    );

    const decision = { reauthentication_token: 'memory-token', reason: null } as const;
    await expectPost(
      api.applyDelinquency('alert/id', decision),
      '/api/v1/risk/alerts/alert%2Fid/apply-delinquency',
      decision,
    );
    await expectPost(
      api.prepareRemoval('distributor/id', { reason: null }),
      '/api/v1/delinquency/distributors/distributor%2Fid/removal-requests',
      { reason: null },
    );
    await expectPost(
      api.approveRemoval('request/id', decision),
      '/api/v1/delinquency/removal-requests/request%2Fid/approve',
      decision,
    );
    await expectPost(
      api.rejectRemoval('request/id', decision),
      '/api/v1/delinquency/removal-requests/request%2Fid/reject',
      decision,
    );
  });

  it('sends only unambiguous filters and never serializes status objects', async () => {
    const promise = firstValueFrom(
      api.distributors({
        branch_id: 'branch-id',
        coordinator_id: '',
        financially_regularized: false,
        consecutive_breaches: 3,
        detected_from: '2026-08-01T00:00:00-06:00',
        per_page: 20,
      }),
    );
    const request = http.expectOne((candidate) => candidate.url === '/api/v1/risk/distributors');
    expect(request.request.params.keys().sort()).toEqual([
      'branch_id',
      'consecutive_breaches',
      'detected_from',
      'financially_regularized',
      'per_page',
    ]);
    expect(request.request.params.get('financially_regularized')).toBe('false');
    expect(request.request.params.has('delinquency_status')).toBe(false);
    expect(request.request.params.has('status')).toBe(false);
    expect(request.request.params.has('type')).toBe(false);
    request.flush(collectionResponse());
    await promise;
  });

  async function expectGet(call: Observable<unknown>, url: string): Promise<void> {
    const promise = firstValueFrom(call);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush(collectionResponse());
    await promise;
  }

  async function expectPost(
    call: Observable<unknown>,
    url: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const promise = firstValueFrom(call);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual(body);
    expect(request.request.headers.has('Idempotency-Key')).toBe(false);
    request.flush({ data: {} });
    await promise;
  }
});

function collectionResponse() {
  return {
    data: [],
    links: { prev: null, next: null },
    meta: { current_page: 1, per_page: 20, total: 0 },
  };
}
