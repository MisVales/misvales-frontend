import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { Observable } from 'rxjs';
import { LoginReq, LoginRes, MfaReq, RecoverReq, ResetPwdReq, InvitationRes } from './auth.dtos';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/auth`;
  }

  // Example CSRF endpoint if needed
  getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.apiConfig.baseUrl}/sanctum/csrf-cookie`);
  }

  login(credentials: LoginReq): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.baseUrl}/login`, credentials);
  }

  verifyMfa(data: MfaReq): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.baseUrl}/mfa/verify`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  recoverAccess(data: RecoverReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/recover`, data);
  }

  resetPassword(data: ResetPwdReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  checkInvitation(token: string): Observable<InvitationRes> {
    return this.http.get<InvitationRes>(`${this.baseUrl}/invitation/${token}`);
  }
}
