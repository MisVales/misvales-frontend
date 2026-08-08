import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get csrf cookie', () => {
    service.getCsrfCookie().subscribe();

    const req = httpTestingController.expectOne('/api/sanctum/csrf-cookie');
    expect(req.request.method).toEqual('GET');
    req.flush({});
  });

  it('should login', async () => {
    const mockCredentials = { email: 'test@test.com', password: 'password' };
    
    const res = await new Promise<any>((resolve) => {
      service.login(mockCredentials).subscribe(resolve);
    });

    expect(res.user?.email).toBe(mockCredentials.email);
    expect(res.token).toBeDefined();
  });

  it('should verify MFA', () => {
    const mockMfaReq = { totpCode: '123456' };
    
    service.verifyMfa(mockMfaReq).subscribe();

    const req = httpTestingController.expectOne('/api/auth/mfa/verify');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(mockMfaReq);
    req.flush({});
  });

  it('should check invitation', () => {
    const token = 'fake-token-123';
    
    service.checkInvitation(token).subscribe();

    const req = httpTestingController.expectOne(`/api/auth/invitation/${token}`);
    expect(req.request.method).toEqual('GET');
    req.flush({});
  });
});
