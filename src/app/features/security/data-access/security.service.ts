import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface TotpSetupRes {
  message?: string;
  totp_secret: string;
  totp_uri: string;
}

export interface SessionDeviceRes {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  is_current: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/me`;

  getSessions(): Observable<SessionDeviceRes[]> {
    return this.http.get<SessionDeviceRes[]>(`${this.baseUrl}/sessions`);
  }

  closeSession(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sessions/${id}`);
  }

  closeAllOtherSessions(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sessions`);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/password`, data);
  }

  regenerateRecoveryCodes(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/recovery-codes`, data);
  }

  getTotpSetup(): Observable<TotpSetupRes> {
    return this.http.get<TotpSetupRes>(`${this.baseUrl}/security/totp/setup`);
  }

  validateCurrentTotp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/totp/validate-current`, data);
  }

  confirmTotpSetup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/totp/confirm`, data);
  }

  getSecurityEvents(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.config.baseUrl}/security-events`, { params: httpParams });
  }

  getPasskeys(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/security/passkeys`);
  }

  registerPasskeyOptions(): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/passkeys/options`, {});
  }

  registerPasskeyConfirm(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/security/passkeys/register`, data);
  }

  deletePasskey(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/security/passkeys/${id}`);
  }
}
