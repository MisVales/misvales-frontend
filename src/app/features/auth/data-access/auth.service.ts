import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/api/api.config';
import { Observable, map } from 'rxjs';
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
    const hostUrl = this.apiConfig.baseUrl.replace('/api/v1', '');
    return this.http.get(`${hostUrl}/sanctum/csrf-cookie`);
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
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      map(res => {
        if (res.mfa_challenge_token) {
          return {
            requiresMfa: true,
            mfaChallengeToken: res.mfa_challenge_token,
            availableMfa: res.available_mfa
          };
        }
        return {
          requiresMfa: false,
          user: res.user,
          token: res.access_token
        };
      })
    );
  }

  verifyMfa(data: MfaReq): Observable<LoginRes> {
    return this.http.post<any>(`${this.baseUrl}/mfa/totp/verify`, data).pipe(
      map(res => {
        if (res.next_step) {
           return {
             requiresMfa: true,
             mfaChallengeToken: res.mfa_challenge_token,
             availableMfa: [res.next_step]
           };
        }
        return {
          requiresMfa: false,
          user: res.user,
          token: res.access_token
        };
      })
    );
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
