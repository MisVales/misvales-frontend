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

  // --- STAFF ENDPOINTS ---

  getStaff(page: number = 1, perPage: number = 10, search?: string, status?: string, role?: string, branchId?: string): Observable<PaginatedRes<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());
      
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (role) params = params.set('role', role);
    if (branchId) params = params.set('branchId', branchId);

    // MOCK RESPONSE PARA LISTADO
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          data: [
            { id: '1', userId: '101', name: 'Administrador Demo', email: 'admin@demo.com', branch: null, effectiveRole: 'admin', assignmentStatus: 'active', assignments: [] },
            { id: '2', userId: '102', name: 'Gerente Norte', email: 'gerente@demo.com', branch: { id: 'b1', name: 'Sucursal Norte' }, effectiveRole: 'gerente', assignmentStatus: 'active', assignments: [] },
            { id: '3', userId: '103', name: 'Cajero Centro', email: 'cajero@demo.com', branch: { id: 'b2', name: 'Sucursal Centro' }, effectiveRole: 'cajero', assignmentStatus: 'active', assignments: [] }
          ],
          total: 3,
          page,
          perPage
        });
        observer.complete();
      }, 500);
    });
  }

  getStaffById(id: string): Observable<any> {
    // MOCK RESPONSE PARA DETALLE
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          id,
          userId: '102',
          name: 'Gerente Norte',
          email: 'gerente@demo.com',
          branch: { id: 'b1', name: 'Sucursal Norte' },
          effectiveRole: 'gerente',
          assignmentStatus: 'active',
          assignments: [
            {
              id: 'a1',
              role: 'gerente',
              branch: { id: 'b1', name: 'Sucursal Norte' },
              scopeType: 'branch',
              startDate: '2026-08-01T00:00:00Z',
              reason: 'Reasignación por apertura de sucursal',
              assignedBy: 'Administrador Demo'
            },
            {
              id: 'a2',
              role: 'cajero',
              branch: { id: 'b2', name: 'Sucursal Centro' },
              scopeType: 'branch',
              startDate: '2025-01-15T00:00:00Z',
              endDate: '2026-08-01T00:00:00Z',
              reason: 'Ingreso',
              assignedBy: 'Administrador Demo'
            }
          ]
        });
        observer.complete();
      }, 500);
    });
  }

  assignStaff(userId: string, data: any): Observable<any> {
    // MOCK RESPONSE PARA ASIGNAR
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Asignación actualizada correctamente' });
        observer.complete();
      }, 800);
    });
  }
}
