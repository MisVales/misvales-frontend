import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { Observable } from 'rxjs';
import { 
  Branch, 
  CreateBranchPayload, 
  UpdateBranchPayload, 
  UpdateBranchStatusPayload,
  PersonnelAssignment,
  AssignPersonnelPayload,
  RemovePersonnelPayload,
  CoordinatorDistributorAssignment,
  AssignCoordinatorDistributorPayload,
  TerminateCoordinatorDistributorPayload
} from './organization.dtos';

@Injectable({
  providedIn: 'root'
})
export class OrganizationApiService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}`; // Módulo 2 endpoints están bajo /api/v1 (baseUrl)
  }

  // --- BRANCHES ENDPOINTS ---

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/branches`);
  }

  createBranch(data: CreateBranchPayload): Observable<Branch> {
    return this.http.post<Branch>(`${this.baseUrl}/branches`, data);
  }

  updateBranch(id: string, data: UpdateBranchPayload): Observable<Branch> {
    return this.http.put<Branch>(`${this.baseUrl}/branches/${id}`, data);
  }

  toggleBranchStatus(id: string, data: UpdateBranchStatusPayload): Observable<Branch> {
    return this.http.patch<Branch>(`${this.baseUrl}/branches/${id}/status`, data);
  }

  // --- PERSONNEL ENDPOINTS ---

  getBranchPersonnel(branchId: string): Observable<PersonnelAssignment[]> {
    return this.http.get<PersonnelAssignment[]>(`${this.baseUrl}/branches/${branchId}/personnel`);
  }

  assignBranchPersonnel(branchId: string, data: AssignPersonnelPayload): Observable<PersonnelAssignment> {
    return this.http.post<PersonnelAssignment>(`${this.baseUrl}/branches/${branchId}/personnel`, data);
  }

  removeBranchPersonnel(branchId: string, assignmentId: string, data?: RemovePersonnelPayload): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/branches/${branchId}/personnel/${assignmentId}`, { body: data });
  }

  // --- COORDINATOR - DISTRIBUTOR ENDPOINTS ---

  getCoordinatorDistributorAssignments(branchId: string): Observable<CoordinatorDistributorAssignment[]> {
    return this.http.get<CoordinatorDistributorAssignment[]>(`${this.baseUrl}/assignments/coordinator-distributor`, {
      params: { branch_id: branchId }
    });
  }

  assignCoordinatorDistributor(data: AssignCoordinatorDistributorPayload): Observable<CoordinatorDistributorAssignment> {
    return this.http.post<CoordinatorDistributorAssignment>(`${this.baseUrl}/assignments/coordinator-distributor`, data);
  }

  terminateCoordinatorDistributorAssignment(assignmentId: string, data: TerminateCoordinatorDistributorPayload): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/assignments/coordinator-distributor/${assignmentId}`, { body: data });
  }
}
