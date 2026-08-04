import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorHandlingInterceptor } from './error-handling.interceptor';
import { Router } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { vi } from 'vitest';

describe('errorHandlingInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let routerSpy: any;
  let sessionStoreSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    sessionStoreSpy = { clearSession: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlingInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should redirect to login on 401 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to /login on 403 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login on 419 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Page Expired', { status: 419, statusText: 'Page Expired' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
