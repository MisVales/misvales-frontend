import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { RoleRes } from './admin.dtos';

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

  updatePermissions(id: string, permissions: string[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/permissions`, { permissions });
  }

  getPermissions(): Observable<any[]> {
    return this.http.get<any[]>(this.permissionsUrl);
  }
}
