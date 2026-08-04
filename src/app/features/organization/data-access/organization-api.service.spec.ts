import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrganizationApiService } from './organization-api.service';
import { API_CONFIG } from '@core/api/api.config';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BranchRes } from './organization.dtos';

describe('OrganizationApiService', () => {
  let service: OrganizationApiService;
  let httpMock: HttpTestingController;

  const mockApiConfig = {
    baseUrl: 'http://test-api.com',
    clientId: 'test-client'
  };

  const mockBranch: BranchRes = {
    id: '1',
    code: 'SUC-001',
    name: 'Sede Principal',
    isHeadquarters: true,
    isActive: true,
    activeStaffCount: 45,
    lockVersion: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganizationApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: mockApiConfig }
      ]
    });

    service = TestBed.inject(OrganizationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get paginated branches', async () => {
    const mockResponse = { data: [mockBranch], total: 1, page: 1, perPage: 10 };
    
    const promise = new Promise(resolve => {
      service.getBranches(1, 10, 'Sede', 'active').subscribe(resolve);
    });

    const req = httpMock.expectOne('http://test-api.com/organization/branches?page=1&perPage=10&search=Sede&status=active');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should create a branch', async () => {
    const reqData = { code: 'SUC-001', name: 'Sede Principal', isHeadquarters: true };
    
    const promise = new Promise(resolve => {
      service.createBranch(reqData).subscribe(resolve);
    });

    const req = httpMock.expectOne('http://test-api.com/organization/branches');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reqData);
    req.flush(mockBranch);

    const res = await promise;
    expect(res).toEqual(mockBranch);
  });

  it('should update a branch and send If-Match header', async () => {
    const reqData = { name: 'Sede Principal 2', isHeadquarters: true };
    
    const promise = new Promise(resolve => {
      service.updateBranch('1', reqData, 2).subscribe(resolve);
    });

    const req = httpMock.expectOne('http://test-api.com/organization/branches/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('If-Match')).toBe('2');
    expect(req.request.body).toEqual(reqData);
    req.flush({ ...mockBranch, name: 'Sede Principal 2', lockVersion: 3 });

    const res: any = await promise;
    expect(res.name).toBe('Sede Principal 2');
    expect(res.lockVersion).toBe(3);
  });

  it('should toggle branch status and send If-Match header', async () => {
    const promise = new Promise(resolve => {
      service.toggleBranchStatus('1', false, 1).subscribe(resolve);
    });

    const req = httpMock.expectOne('http://test-api.com/organization/branches/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.headers.get('If-Match')).toBe('1');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ ...mockBranch, isActive: false, lockVersion: 2 });

    const res: any = await promise;
    expect(res.isActive).toBe(false);
    expect(res.lockVersion).toBe(2);
  });
});
