import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { map, Observable } from 'rxjs';
import {
  AssignCoordinatorDistributorPayload,
  AssignPersonnelPayload,
  Branch,
  CoordinatorDistributorAssignment,
  CreateBranchPayload,
  DataRes,
  DistributorCandidate,
  PaginatedRes,
  PersonnelAssignment,
  UpdateBranchPayload,
  UserAssignment,
} from './organization.dtos';

@Injectable({ providedIn: 'root' })
export class OrganizationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly baseUrl = this.apiConfig.baseUrl;

  getBranches(filters: { page?: number; per_page?: number; search?: string; status?: string; eligible_for_manager?: boolean } = {}): Observable<PaginatedRes<Branch>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<PaginatedRes<Branch>>(`${this.baseUrl}/branches`, { params });
  }

  getBranch(id: string): Observable<Branch> {
    return this.http.get<DataRes<Branch>>(`${this.baseUrl}/branches/${id}`).pipe(map((response) => response.data));
  }

  createBranch(data: CreateBranchPayload): Observable<Branch> {
    return this.http.post<DataRes<Branch>>(`${this.baseUrl}/branches`, data).pipe(map((response) => response.data));
  }

  updateBranch(id: string, data: UpdateBranchPayload): Observable<Branch> {
    const headers = new HttpHeaders().set('If-Match', `"${data.lock_version}"`);
    return this.http.patch<DataRes<Branch>>(`${this.baseUrl}/branches/${id}`, data, { headers })
      .pipe(map((response) => response.data));
  }

  changeBranchStatus(branch: Branch, active: boolean): Observable<Branch> {
    const action = active ? 'activate' : 'deactivate';
    const headers = new HttpHeaders().set('If-Match', `"${branch.lock_version}"`);
    return this.http.post<DataRes<Branch>>(`${this.baseUrl}/branches/${branch.id}/${action}`, {}, { headers })
      .pipe(map((response) => response.data));
  }

  getPersonnel(filters: {
    page?: number;
    per_page?: number;
    branch_id?: string;
    role_id?: string;
    user_state?: string;
    assignment_status?: string;
  } = {}): Observable<PaginatedRes<PersonnelAssignment>> {
    return this.http.get<PaginatedRes<PersonnelAssignment>>(`${this.baseUrl}/personnel`, {
      params: this.params(filters),
    });
  }

  getBranchPersonnel(branchId: string, page = 1, perPage = 100): Observable<PaginatedRes<PersonnelAssignment>> {
    return this.http.get<PaginatedRes<PersonnelAssignment>>(`${this.baseUrl}/branches/${branchId}/personnel`, {
      params: this.params({ page, per_page: perPage }),
    });
  }

  getBranchAssignments(
    branchId: string,
    options: { includeHistory?: boolean; status?: PersonnelAssignment['assignment_status'] } = {},
  ): Observable<PaginatedRes<PersonnelAssignment>> {
    return this.http.get<PaginatedRes<PersonnelAssignment>>(`${this.baseUrl}/branches/${branchId}/assignments`, {
      params: this.params({ include_history: options.includeHistory, status: options.status, per_page: 100 }),
    });
  }

  getUserAssignments(userId: string, includeHistory = false): Observable<UserAssignment[]> {
    return this.http.get<UserAssignment[]>(`${this.baseUrl}/users/${userId}/assignments`, {
      params: this.params({ include_history: includeHistory }),
    });
  }

  assignPersonnel(userId: string, data: AssignPersonnelPayload): Observable<UserAssignment> {
    return this.http.post<{ assignment: UserAssignment }>(`${this.baseUrl}/users/${userId}/assignments`, data)
      .pipe(map((response) => response.assignment));
  }

  endPersonnelAssignment(userId: string, assignmentId: string, reason: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}/assignments/${assignmentId}`, { body: { reason } });
  }

  getCoordinatorDistributorAssignments(branchId: string, includeHistory = true): Observable<CoordinatorDistributorAssignment[]> {
    return this.http.get<{ data: CoordinatorDistributorAssignment[] }>(`${this.baseUrl}/assignments/coordinator-distributor`, {
      params: this.params({ branch_id: branchId, include_history: includeHistory }),
    }).pipe(map((response) => response.data));
  }

  assignCoordinatorDistributor(data: AssignCoordinatorDistributorPayload): Observable<CoordinatorDistributorAssignment> {
    return this.http.post<DataRes<CoordinatorDistributorAssignment>>(`${this.baseUrl}/assignments/coordinator-distributor`, data)
      .pipe(map((response) => response.data));
  }

  terminateCoordinatorDistributorAssignment(assignmentId: string, endReason: string): Observable<CoordinatorDistributorAssignment> {
    return this.http.delete<DataRes<CoordinatorDistributorAssignment>>(`${this.baseUrl}/assignments/coordinator-distributor/${assignmentId}`, {
      body: { end_reason: endReason },
    }).pipe(map((response) => response.data));
  }

  getActiveDistributorCandidates(branchId: string): Observable<DistributorCandidate[]> {
    return this.http.get<{ data: DistributorCandidate[] }>(`${this.baseUrl}/assignments/distributors`, {
      params: this.params({ branch_id: branchId }),
    }).pipe(map((response) => response.data));
  }

  private params(values: Record<string, string | number | boolean | undefined>): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return params;
  }
}
