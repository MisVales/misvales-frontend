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

  getRoles(): Observable<RoleRes[]> {
    return this.http.get<RoleRes[]>(this.baseUrl);
  }
}
