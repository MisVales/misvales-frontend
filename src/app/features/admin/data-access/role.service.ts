import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { PermissionRes, RoleRes } from './admin.dtos';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/roles`;
  private readonly permissionsUrl = `${this.config.baseUrl}/permissions`;

  getRoles(): Observable<RoleRes[]> {
    return this.http.get<RoleRes[]>(this.baseUrl);
  }

  getRole(id: string): Observable<RoleRes> {
    return this.http.get<RoleRes>(`${this.baseUrl}/${id}`);
  }

  updatePermissions(id: string, permissions: string[]): Observable<{ message: string; role: RoleRes }> {
    return this.http.put<{ message: string; role: RoleRes }>(`${this.baseUrl}/${id}/permissions`, { permissions });
  }

  getPermissions(): Observable<PermissionRes[]> {
    return this.http.get<PermissionRes[]>(this.permissionsUrl);
  }
}
