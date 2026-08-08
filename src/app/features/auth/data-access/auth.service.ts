import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { Observable, tap } from 'rxjs';
import Cookies from 'js-cookie';
import { LoginReq, LoginRes, MfaReq, RecoverReq, ResetPwdReq, InspectInvitationReq, InspectInvitationRes, SetupInvitationReq, SetupInvitationRes, CompleteInvitationReq, ResendInvitationReq, ResendInvitationRes, PasskeySetupReq, PasskeyRegisterReq } from './auth.dtos';

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

  // WEBAUTHN MOCKS
  getWebAuthnChallenge(email?: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock simple challenge
        observer.next({
          publicKey: {
            challenge: new Uint8Array([1, 2, 3, 4]),
            rpId: window.location.hostname,
            timeout: 60000,
            userVerification: 'preferred'
          }
        });
        observer.complete();
      }, 300);
    });
  }

  getWebAuthnRegisterChallenge(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          publicKey: {
            challenge: new Uint8Array([5, 6, 7, 8]),
            rp: { name: "MisVales", id: window.location.hostname },
            user: {
              id: new Uint8Array([1]),
              name: "admin@demo.com",
              displayName: "Administrador Demo"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "direct"
          }
        });
        observer.complete();
      }, 300);
    });
  }

  registerWebAuthn(response: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }

  login(credentials: LoginReq): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.baseUrl}/login`, credentials).pipe(
      tap(this.saveTokensIfPresent)
    );
  }

  verifyMfa(data: MfaReq): Observable<LoginRes> {
    if (data.recovery_code) {
      return this.http.post<LoginRes>(`${this.baseUrl}/mfa/recovery-code/verify`, data).pipe(
        tap(this.saveTokensIfPresent)
      );
    }
    return this.http.post<LoginRes>(`${this.baseUrl}/mfa/totp/verify`, data).pipe(
      tap(this.saveTokensIfPresent)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
      })
    );
  }

  private saveTokensIfPresent = (response: LoginRes) => {
    if (response.access_token) {
      const expires = response.expires_in ? response.expires_in / (24 * 60 * 60) : 1; // Default 1 day if missing
      Cookies.set('access_token', response.access_token, { 
        expires, 
        secure: true, 
        sameSite: 'strict' 
      });
    }
    if (response.refresh_token) {
      Cookies.set('refresh_token', response.refresh_token, { 
        expires: 7, 
        secure: true, 
        sameSite: 'strict' 
      });
    }
  };

  recoverAccess(data: RecoverReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/password/forgot`, data);
  }

  resetPassword(data: ResetPwdReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/password/reset`, data);
  }

  inspectInvitation(data: InspectInvitationReq): Observable<InspectInvitationRes> {
    return this.http.post<InspectInvitationRes>(`${this.baseUrl}/invitations/inspect`, data);
  }

  setupInvitation(data: SetupInvitationReq): Observable<SetupInvitationRes> {
    return this.http.post<SetupInvitationRes>(`${this.baseUrl}/invitations/setup`, data);
  }

  completeInvitation(data: CompleteInvitationReq): Observable<any> {
    return this.http.post(`${this.baseUrl}/invitations/complete`, data);
  }

  resendInvitation(data: ResendInvitationReq): Observable<ResendInvitationRes> {
    return this.http.post<ResendInvitationRes>(`${this.baseUrl}/invitations/resend`, data);
  }

  setupPasskey(data: PasskeySetupReq): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/invitations/passkey/setup`, data);
  }

  registerPasskey(data: PasskeyRegisterReq): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/invitations/passkey/register`, data);
  }

  getPasskeyOptions(data: { mfa_challenge_token: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/mfa/passkey/options`, data);
  }

  verifyPasskey(data: import('./auth.dtos').PasskeyVerifyReq): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.baseUrl}/mfa/passkey/verify`, data).pipe(
      tap(this.saveTokensIfPresent)
    );
  }
}
