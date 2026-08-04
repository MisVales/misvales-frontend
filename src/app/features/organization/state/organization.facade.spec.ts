import { TestBed } from '@angular/core/testing';
import { OrganizationFacade } from './organization.facade';
import { OrganizationApiService } from '../data-access/organization-api.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('OrganizationFacade', () => {
  let facade: any;
  let apiServiceMock: any;

  const mockBranch = {
    id: '1',
    code: 'SUC-001',
    name: 'Sede Principal',
    isHeadquarters: true,
    isActive: true,
    activeStaffCount: 45,
    lockVersion: 1
  };

  beforeEach(() => {
    apiServiceMock = {
      getBranches: vi.fn(),
      getBranchById: vi.fn(),
      createBranch: vi.fn(),
      updateBranch: vi.fn(),
      toggleBranchStatus: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: OrganizationApiService, useValue: apiServiceMock }
      ]
    });

    facade = TestBed.inject(OrganizationFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load branches successfully', async () => {
    const mockRes = { data: [mockBranch], total: 1, page: 1, perPage: 10 };
    apiServiceMock.getBranches.mockReturnValue(of(mockRes));

    await facade.loadBranches();

    expect(facade.isLoading()).toBe(false);
    expect(facade.branches()).toEqual([mockBranch]);
    expect(facade.total()).toBe(1);
    expect(facade.error()).toBeNull();
  });

  it('should handle error when loading branches', async () => {
    apiServiceMock.getBranches.mockReturnValue(throwError(() => ({ error: { message: 'Network error' } })));

    await facade.loadBranches();

    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBe('Network error');
  });

  it('should handle 409 conflict when updating branch', async () => {
    apiServiceMock.updateBranch.mockReturnValue(throwError(() => ({ status: 409 })));

    const result = await facade.updateBranch('1', { name: 'Test', isHeadquarters: false }, 1);

    expect(result).toBe(false);
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toContain('Conflicto de concurrencia');
  });

  it('should create branch and update state', async () => {
    apiServiceMock.createBranch.mockReturnValue(of(mockBranch));
    // Initial state setup to test if branch is added to top
    // However, it's easier to just call create and check if it's there
    
    const result = await facade.createBranch({ code: 'SUC-001', name: 'Sede Principal', isHeadquarters: true });

    expect(result).toBe(true);
    expect(facade.branches().length).toBe(1);
    expect(facade.branches()[0]).toEqual(mockBranch);
    expect(facade.total()).toBe(1); // from 0 to 1
  });
});
