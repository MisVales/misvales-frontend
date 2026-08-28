import { HttpClient, HttpHeaders, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { map, Observable, switchMap, tap } from 'rxjs';
import { AuthTokenStore } from '@core/session/auth-token.store';
import type { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import {
  LoginReq,
  LoginRes,
  MfaReq,
  RecoverReq,
  ResetPwdReq,
  InspectInvitationReq,
  InspectInvitationRes,
  SetupInvitationReq,
  SetupInvitationRes,
  CompleteInvitationReq,
  ResendInvitationReq,
  ResendInvitationRes,
  PasskeySetupReq,
  PasskeyRegisterReq,
  PasskeyVerifyReq,
  ApiMessageRes,
} from './auth.dtos';

export interface LocalSwitchAccount {
  id: string;
  name: string;
  email: string;
  role_code: string;
  role_name: string;
  distributor_number?: string;
}

export interface LocalSwitchAccounts {
  accounts: LocalSwitchAccount[];
  distributors: LocalSwitchAccount[];
}

type AuthenticationOptionsJSON = Parameters<typeof startAuthentication>[0]['optionsJSON'];
type RegistrationOptionsJSON = Parameters<typeof startRegistration>[0]['optionsJSON'];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);
  private tokenStore = inject(AuthTokenStore);
  private xsrfTokenExtractor = inject(HttpXsrfTokenExtractor);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/auth`;
  }

  getCsrfCookie(): Observable<unknown> {
    return this.http.get(this.csrfCookieUrl, { withCredentials: true });
  }

  login(credentials: LoginReq): Observable<LoginRes> {
    return this.postWithCsrf<LoginRes>(`${this.baseUrl}/login`, credentials).pipe(
      tap(this.saveTokensIfPresent),
    );
  }

  verifyMfa(data: MfaReq): Observable<LoginRes> {
    if (data.recovery_code) {
      return this.postWithCsrf<LoginRes>(`${this.baseUrl}/mfa/recovery-code/verify`, data).pipe(
        tap(this.saveTokensIfPresent),
      );
    }
    return this.postWithCsrf<LoginRes>(`${this.baseUrl}/mfa/totp/verify`, data).pipe(
      tap(this.saveTokensIfPresent),
    );
  }

  logout(): Observable<unknown> {
    return this.postWithCsrf<unknown>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.tokenStore.clear()),
    );
  }

  localAccounts(): Observable<LocalSwitchAccounts> {
    return this.http
      .get<{ data: LocalSwitchAccounts }>(`${this.baseUrl}/local/accounts`)
      .pipe(map((response) => response.data));
  }

  switchLocalAccount(userId: string): Observable<LoginRes> {
    return this.postWithCsrf<LoginRes>(`${this.baseUrl}/local/switch-account`, {
      user_id: userId,
    }).pipe(tap(this.saveTokensIfPresent));
  }

  private saveTokensIfPresent = (response: LoginRes) => {
    if (response.access_token && response.expires_in) {
      this.tokenStore.set(response.access_token, response.expires_in);
    }
  };

  recoverAccess(data: RecoverReq): Observable<ApiMessageRes> {
    return this.postWithCsrf<ApiMessageRes>(`${this.baseUrl}/password/forgot`, data);
  }

  resetPassword(data: ResetPwdReq): Observable<ApiMessageRes> {
    return this.postWithCsrf<ApiMessageRes>(`${this.baseUrl}/password/reset`, data);
  }

  inspectInvitation(data: InspectInvitationReq): Observable<InspectInvitationRes> {
    return this.postWithCsrf<InspectInvitationRes>(`${this.baseUrl}/invitations/inspect`, data);
  }

  setupInvitation(data: SetupInvitationReq): Observable<SetupInvitationRes> {
    return this.postWithCsrf<SetupInvitationRes>(`${this.baseUrl}/invitations/setup`, data);
  }

  completeInvitation(data: CompleteInvitationReq): Observable<ApiMessageRes> {
    return this.postWithCsrf<ApiMessageRes>(`${this.baseUrl}/invitations/complete`, data);
  }

  resendInvitation(data: ResendInvitationReq): Observable<ResendInvitationRes> {
    return this.postWithCsrf<ResendInvitationRes>(`${this.baseUrl}/invitations/resend`, data);
  }

  setupPasskey(data: PasskeySetupReq): Observable<RegistrationOptionsJSON> {
    return this.postWithCsrf<RegistrationOptionsJSON>(
      `${this.baseUrl}/invitations/passkey/setup`,
      data,
    );
  }

  registerPasskey(data: PasskeyRegisterReq): Observable<ApiMessageRes> {
    return this.postWithCsrf<ApiMessageRes>(`${this.baseUrl}/invitations/passkey/register`, data);
  }

  getPasskeyOptions(data: { mfa_challenge_token: string }): Observable<AuthenticationOptionsJSON> {
    return this.postWithCsrf<AuthenticationOptionsJSON>(
      `${this.baseUrl}/mfa/passkey/options`,
      data,
    );
  }

  verifyPasskey(data: PasskeyVerifyReq): Observable<LoginRes> {
    return this.postWithCsrf<LoginRes>(`${this.baseUrl}/mfa/passkey/verify`, data).pipe(
      tap(this.saveTokensIfPresent),
    );
  }

  skipDevelopmentMfa(data: {
    mfa_challenge_token: string;
    factor: 'TOTP' | 'PASSKEY';
  }): Observable<LoginRes> {
    return this.postWithCsrf<LoginRes>(`${this.baseUrl}/mfa/development/skip`, data).pipe(
      tap(this.saveTokensIfPresent),
    );
  }

  private postWithCsrf<T>(url: string, body: unknown): Observable<T> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        const token = this.xsrfTokenExtractor.getToken();
        const headers = token ? new HttpHeaders({ 'X-XSRF-TOKEN': token }) : undefined;

        return this.http.post<T>(url, body, { headers, withCredentials: true });
      }),
    );
  }

  private get csrfCookieUrl(): string {
    return `${this.apiConfig.baseUrl.replace(/\/api\/v1\/?$/, '')}/sanctum/csrf-cookie`;
  }
}
