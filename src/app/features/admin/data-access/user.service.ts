import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { 
  UserListFilterReq, UserListRes, UserRes, UserCreateReq, UserUpdateReq, UserAssignmentReq, UserAssignmentRes
} from './admin.dtos';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/users`;

  getUsers(filters: UserListFilterReq): Observable<UserListRes> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.state) params = params.set('state', filters.state);
    if (filters.role_id) params = params.set('role_id', filters.role_id);
    if (filters.branch_id) params = params.set('branch_id', filters.branch_id);
    if (filters.page) params = params.set('page', filters.page.toString());

    return this.http.get<UserListRes>(this.baseUrl, { params });
  }

  getUser(id: string): Observable<UserRes> {
    return this.http.get<UserRes>(`${this.baseUrl}/${id}`);
  }

  createAccount(data: UserCreateReq): Observable<UserRes> {
    return this.http.post<UserRes>(this.baseUrl, data);
  }

  sendInvitation(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/invite`, {});
  }

  updateUser(id: string, data: UserUpdateReq): Observable<UserRes> {
    return this.http.patch<UserRes>(`${this.baseUrl}/${id}`, data);
  }

  requirePasswordChange(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/require-password-change`, {});
  }

  assignRole(id: string, data: UserAssignmentReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/assignments`, data);
  }

  revokeRole(id: string, assignmentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/assignments/${assignmentId}`);
  }

  blockUser(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/block`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/unblock`, {});
  }

  disableUser(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/disable`, {});
  }

  enableUser(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/enable`, {});
  }

  getAssignments(id: string): Observable<UserAssignmentRes[]> {
    return this.http.get<UserAssignmentRes[]>(`${this.baseUrl}/${id}/assignments`);
  }
}
