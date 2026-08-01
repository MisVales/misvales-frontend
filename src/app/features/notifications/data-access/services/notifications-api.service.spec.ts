import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { NotificationsApiService } from './notifications-api.service';

describe('NotificationsApiService', () => {
  let api: NotificationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(NotificationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries only a documented personal notification status', async () => {
    const promise = firstValueFrom(api.list('UNREAD'));
    const request = http.expectOne((candidate) => candidate.url === '/api/v1/notifications');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual(['status']);
    expect(request.request.params.get('status')).toBe('UNREAD');
    expect(request.request.params.has('page')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
    request.flush(collectionResponse());
    await promise;
  });

  it('marks one opaque notification as read with an empty body', async () => {
    const promise = firstValueFrom(api.markRead('notification/id'));
    const request = http.expectOne('/api/v1/notifications/notification%2Fid/read');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.headers.has('Idempotency-Key')).toBe(false);
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
