import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { commandInterceptor } from '@core/interceptors/command.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { AccountsApiService } from './accounts-api.service';

describe('AccountsApiService', () => {
  let api: AccountsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([apiUrlInterceptor, credentialsInterceptor, commandInterceptor]),
        ),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(AccountsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses idempotency only for account requests and reuses the logical command key', async () => {
    const command = api.newIdempotentCommand();
    const payload = {
      name: 'User',
      email: 'user@example.test',
      role: 'COORDINATOR' as const,
      reason: 'Alta operativa',
      reauth_token: 'authorization',
    };
    const first = firstValueFrom(api.createRequest(payload, command));
    const firstRequest = http.expectOne('/api/v1/account-requests');
    const key = firstRequest.request.headers.get('Idempotency-Key');
    expect(key).toBeTruthy();
    firstRequest.flush({ data: { public_id: 'request-id', state: 'PENDING_APPROVAL' } });
    await first;

    const retry = firstValueFrom(api.createRequest(payload, command));
    const retryRequest = http.expectOne('/api/v1/account-requests');
    expect(retryRequest.request.headers.get('Idempotency-Key')).toBe(key);
    retryRequest.flush({ data: { public_id: 'request-id', state: 'PENDING_APPROVAL' } });
    await retry;

    const direct = firstValueFrom(
      api.createAccount({
        name: 'Admin',
        email: 'admin@example.test',
        role: 'ADMINISTRATOR',
        branch_id: null,
        authorization_token: 'authorization',
      }),
    );
    const directRequest = http.expectOne('/api/v1/accounts');
    expect(directRequest.request.headers.has('Idempotency-Key')).toBe(false);
    directRequest.flush({ data: {} });
    await direct;
  });

  it('lists and decides account requests with exact paths', async () => {
    const list = firstValueFrom(api.accountRequests());
    http.expectOne('/api/v1/account-requests').flush({
      data: {
        data: [],
        current_page: 1,
        per_page: 25,
        total: 0,
        prev_page_url: null,
        next_page_url: null,
      },
    });
    await list;

    const nextPage = firstValueFrom(
      api.accountRequests('https://api.example.test/api/v1/account-requests?page=2'),
    );
    http.expectOne('/api/v1/account-requests?page=2').flush({
      data: {
        data: [],
        current_page: 2,
        per_page: 25,
        total: 0,
        prev_page_url: '/api/v1/account-requests?page=1',
        next_page_url: null,
      },
    });
    expect((await nextPage).meta.current_page).toBe(2);

    const decision = firstValueFrom(api.decide('request-id', 'approve', 'Motivo', 'authorization'));
    const request = http.expectOne('/api/v1/account-requests/request-id/approve');
    expect(request.request.body).toEqual({ reason: 'Motivo', reauth_token: 'authorization' });
    request.flush({ data: { public_id: 'request-id', state: 'APPROVED' } });
    await decision;
  });
});
