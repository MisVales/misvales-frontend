import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { startRegistration } from '@simplewebauthn/browser';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

type RegistrationOptionsJSON = Parameters<typeof startRegistration>[0]['optionsJSON'];

export interface SecurityMessageRes { message: string; }
export interface ChangePasswordReq {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
  totp_code?: string;
}
export interface RecoveryCodesReq { current_password: string; totp_code?: string; }
export interface RecoveryCodesRes extends SecurityMessageRes { recovery_codes: string[]; }
export interface TotpValidationReq { current_password: string; totp_code: string; }
export interface TotpConfirmationReq { current_password: string; new_totp_code: string; }
export interface TotpSetupRes { message?: string; totp_secret: string; totp_uri: string; }
export interface SessionDeviceRes {
  id: string;
  authentication_method?: string;
  mfa_method?: string | null;
  ip_address: string;
  user_agent: string;
  device_name?: string | null;
  last_activity_at: string;
  expires_at?: string | null;
  is_current: boolean;
}
export interface SecurityEventFilters {
  user_id?: string;
  actor_user_id?: string;
  event_type?: string;
  severity?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}
export interface SecurityEventRes {
  id: string;
  user_id?: string | null;
  actor_user_id?: string | null;
  event_type: string;
  severity: string;
  outcome: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  occurred_at: string;
}
export interface PaginatedSecurityEvents {
  data: SecurityEventRes[];
  current_page: number;
  last_page: number;
  total: number;
}
export interface PasskeyRes { id: string; created_at: string; last_used_at?: string | null; }
export interface PasskeyRegisterReq { clientDataJSON: string; attestationObject: string; }

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/me`;

  getSessions(): Observable<SessionDeviceRes[]> {
    return this.http.get<SessionDeviceRes[]>(`${this.baseUrl}/sessions`);
  }

  closeSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  closeAllOtherSessions(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions`);
  }

  changePassword(data: ChangePasswordReq): Observable<SecurityMessageRes> {
    return this.http.post<SecurityMessageRes>(`${this.baseUrl}/security/password`, data);
  }

  regenerateRecoveryCodes(data: RecoveryCodesReq): Observable<RecoveryCodesRes> {
    return this.http.post<RecoveryCodesRes>(`${this.baseUrl}/security/recovery-codes`, data);
  }

  getTotpSetup(): Observable<TotpSetupRes> {
    return this.http.get<TotpSetupRes>(`${this.baseUrl}/security/totp/setup`);
  }

  validateCurrentTotp(data: TotpValidationReq): Observable<SecurityMessageRes> {
    return this.http.post<SecurityMessageRes>(`${this.baseUrl}/security/totp/validate-current`, data);
  }

  confirmTotpSetup(data: TotpConfirmationReq): Observable<SecurityMessageRes> {
    return this.http.post<SecurityMessageRes>(`${this.baseUrl}/security/totp/confirm`, data);
  }

  getSecurityEvents(filters: SecurityEventFilters): Observable<PaginatedSecurityEvents> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<PaginatedSecurityEvents>(`${this.config.baseUrl}/security-events`, { params });
  }

  getPasskeys(): Observable<PasskeyRes[]> {
    return this.http.get<PasskeyRes[]>(`${this.baseUrl}/security/passkeys`);
  }

  registerPasskeyOptions(): Observable<RegistrationOptionsJSON> {
    return this.http.post<RegistrationOptionsJSON>(`${this.baseUrl}/security/passkeys/options`, {});
  }

  registerPasskeyConfirm(data: PasskeyRegisterReq): Observable<SecurityMessageRes> {
    return this.http.post<SecurityMessageRes>(`${this.baseUrl}/security/passkeys/register`, data);
  }

  deletePasskey(id: string): Observable<SecurityMessageRes> {
    return this.http.delete<SecurityMessageRes>(`${this.baseUrl}/security/passkeys/${id}`);
  }
}
