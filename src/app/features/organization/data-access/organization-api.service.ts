import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { Observable } from 'rxjs';
import { BranchRes, CreateBranchReq, PaginatedRes, UpdateBranchReq } from './organization.dtos';

@Injectable({
  providedIn: 'root'
})
export class OrganizationApiService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/organization`;
  }

  getBranches(page: number = 1, perPage: number = 10, search?: string, status?: string): Observable<PaginatedRes<BranchRes>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());
      
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedRes<BranchRes>>(`${this.baseUrl}/branches`, { params });
  }

  getBranchById(id: string): Observable<BranchRes> {
    return this.http.get<BranchRes>(`${this.baseUrl}/branches/${id}`);
  }

  createBranch(data: CreateBranchReq): Observable<BranchRes> {
    return this.http.post<BranchRes>(`${this.baseUrl}/branches`, data);
  }

  updateBranch(id: string, data: UpdateBranchReq, lockVersion: number): Observable<BranchRes> {
    const headers = new HttpHeaders().set('If-Match', lockVersion.toString());
    return this.http.put<BranchRes>(`${this.baseUrl}/branches/${id}`, data, { headers });
  }

  toggleBranchStatus(id: string, isActive: boolean, lockVersion: number): Observable<BranchRes> {
    const headers = new HttpHeaders().set('If-Match', lockVersion.toString());
    return this.http.patch<BranchRes>(`${this.baseUrl}/branches/${id}/status`, { isActive }, { headers });
  }
}
