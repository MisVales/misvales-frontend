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
    // MOCK LOGIN FOR UI TESTING
    return new Observable<LoginRes>(observer => {
      setTimeout(() => {
        // Simulamos error si el passkey es inválido
        if (credentials.webauthnResponse && credentials.webauthnResponse.id === 'error') {
          observer.error({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Passkey inválido' } });
          return;
        }

        observer.next({
          requiresMfa: false,
          user: {
            id: '1',
            name: 'Administrador Demo',
            email: credentials.email || 'passkey@demo.com',
            roles: ['admin'],
            permissions: ['all']
          },
          token: 'mock-jwt-token'
        });
        observer.complete();
      }, 800);
    });
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
