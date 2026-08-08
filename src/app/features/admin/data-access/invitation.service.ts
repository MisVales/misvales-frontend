import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface InvitationRes {
  id: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  state: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expires_at: string;
  inspected_at?: string;
  mfa_setup_completed_at?: string;
  attempt_count: number;
  created_at: string;
}

export interface PaginatedInvitations {
  data: InvitationRes[];
  current_page: number;
  total?: number;
  last_page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/invitations`;
  private readonly usersUrl = `${this.config.baseUrl}/users`;

  getInvitations(page: number = 1, state?: string, search?: string): Observable<PaginatedInvitations> {
    let params = new HttpParams().set('page', page.toString());
    if (state) params = params.set('state', state);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedInvitations>(this.baseUrl, { params });
  }

  sendInvitation(data: { name: string; email: string; role_id?: string; branch_id?: string | null; send_invitation: boolean }): Observable<any> {
    // Note: Creating a user with send_invitation: true is how we send invitations according to backend docs
    return this.http.post(this.usersUrl, data);
  }
}
