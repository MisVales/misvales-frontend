import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { ReportingApiService } from './reporting-api.service';

describe('ReportingApiService', () => {
  let api: ReportingApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(ReportingApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the seven documented reporting contracts', async () => {
    await expectGet(api.catalog(), '/api/v1/reports');
    await expectGet(api.definition('report/code'), '/api/v1/reports/report%2Fcode/definition');
    await expectGet(api.execute('report/code'), '/api/v1/reports/report%2Fcode');
    await expectGet(api.runs(), '/api/v1/report-runs');
    await expectGet(api.run('run/id'), '/api/v1/report-runs/run%2Fid');
    await expectGet(api.runResults('run/id'), '/api/v1/report-runs/run%2Fid/results');

    const promise = firstValueFrom(
      api.createRun('report/code', { branch_id: 'branch-id' }, 'stable-attempt-key'),
    );
    const request = http.expectOne('/api/v1/reports/report%2Fcode/runs');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ branch_id: 'branch-id' });
    expect(request.request.headers.get('Idempotency-Key')).toBe('stable-attempt-key');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ data: {} });
    await promise;
  });

  it('serializes reserved and dynamic report filters deterministically', async () => {
    const promise = firstValueFrom(
      api.execute('authorized-report', {
        page: 2,
        per_page: 25,
        sort: 'created_at',
        direction: 'desc',
        filters: {
          status: 'ACTIVE',
          branch_id: 'branch-id',
          page: 99,
          ignored_empty: '',
        },
      }),
    );
    const request = http.expectOne(
      (candidate) => candidate.url === '/api/v1/reports/authorized-report',
    );
    expect(request.request.params.keys()).toEqual([
      'page',
      'per_page',
      'sort',
      'direction',
      'branch_id',
      'status',
    ]);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.has('ignored_empty')).toBe(false);
    request.flush(collectionResponse());
    await promise;
  });

  it('uses only page and per_page for report run pagination', async () => {
    const promise = firstValueFrom(api.runResults('run-id', { page: 3, per_page: 50 }));
    const request = http.expectOne(
      (candidate) => candidate.url === '/api/v1/report-runs/run-id/results',
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
});

function collectionResponse() {
  return {
    data: [],
    links: { prev: null, next: null },
    meta: { current_page: 1, per_page: 25, total: 0 },
  };
}
