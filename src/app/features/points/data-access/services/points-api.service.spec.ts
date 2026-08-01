import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { PointsApiService } from './points-api.service';

describe('PointsApiService', () => {
  let api: PointsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(PointsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the 14 documented point and redemption contracts', async () => {
    await expectGet(api.ownBalance(), '/api/v1/me/points');
    await expectGet(api.ownMovements(), '/api/v1/me/points/movements');
    await expectGet(
      api.distributorBalance('distributor/id'),
      '/api/v1/distributors/distributor%2Fid/points',
    );
    await expectGet(
      api.distributorMovements('distributor/id'),
      '/api/v1/distributors/distributor%2Fid/points/movements',
    );
    await expectGet(
      api.relationEvaluation('relation/id'),
      '/api/v1/relations/relation%2Fid/points',
    );
    await expectGet(api.currentRedemptionPeriod(), '/api/v1/point-redemption-periods/current');
    await expectGet(api.ownRedemptions(), '/api/v1/me/point-redemptions');
    await expectGet(api.redemptions(), '/api/v1/point-redemptions');
    await expectGet(api.redemption('redemption/id'), '/api/v1/point-redemptions/redemption%2Fid');
    await expectGet(api.runs(), '/api/v1/points-runs');
    await expectGet(api.run('run/id'), '/api/v1/points-runs/run%2Fid');
    await expectGet(api.runItems('run/id'), '/api/v1/points-runs/run%2Fid/items');

    const decision = { reauthentication_token: 'memory-token', reason: null } as const;
    await expectPost(
      api.authorizeRedemption('redemption/id', decision),
      '/api/v1/point-redemptions/redemption%2Fid/authorize',
      decision,
    );
    await expectPost(
      api.rejectRedemption('redemption/id', decision),
      '/api/v1/point-redemptions/redemption%2Fid/reject',
      decision,
    );
  });

  it('sends only unambiguous ledger filters and omits empty values', async () => {
    const promise = firstValueFrom(
      api.ownMovements({
        per_page: 20,
        relation_id: 'relation-id',
        date_from: '2026-08-01T00:00:00-06:00',
        date_to: '',
      }),
    );
    const request = http.expectOne((candidate) => candidate.url === '/api/v1/me/points/movements');
    expect(request.request.params.keys().sort()).toEqual(['date_from', 'per_page', 'relation_id']);
    expect(request.request.params.has('type')).toBe(false);
    expect(request.request.params.has('status')).toBe(false);
    request.flush(collectionResponse());
    await promise;
  });

  it('uses only documented run pagination parameters', async () => {
    const promise = firstValueFrom(api.runItems('run-id', { page: 2, per_page: 25 }));
    const request = http.expectOne(
      (candidate) => candidate.url === '/api/v1/points-runs/run-id/items',
    );
    expect(request.request.params.keys().sort()).toEqual(['page', 'per_page']);
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
