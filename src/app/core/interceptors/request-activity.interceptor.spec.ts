import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RequestActivityService } from '../observability/request-activity.service';
import { requestActivityInterceptor, SKIP_GLOBAL_LOADING } from './request-activity.interceptor';

describe('requestActivityInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let activity: RequestActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([requestActivityInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    activity = TestBed.inject(RequestActivityService);
  });

  afterEach(() => controller.verify());

  it('tracks a request until it completes', () => {
    http.get('/tracked').subscribe();
    expect(activity.pendingCount()).toBe(1);

    controller.expectOne('/tracked').flush({});
    expect(activity.pendingCount()).toBe(0);
  });

  it('allows silent background requests', () => {
    http.get('/background', {
      context: new HttpContext().set(SKIP_GLOBAL_LOADING, true),
    }).subscribe();

    expect(activity.pendingCount()).toBe(0);
    controller.expectOne('/background').flush({});
  });
});
