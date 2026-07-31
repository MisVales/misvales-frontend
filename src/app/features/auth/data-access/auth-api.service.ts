import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { ApiMessageResponse } from '@core/api/api-response.models';
import { WebAuthnAssertionPayload } from '@core/security/webauthn.util';

import {
  CompleteInvitationRequest,
  CompleteInvitationResult,
  CompleteRecoveryRequest,
  InvitationInspection,
  LoginRequest,
  LoginResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/auth/login', payload, { context: internalApiContext() })
      .pipe(map(validateLoginResponse));
  }

  verifyTotp(mfaToken: string, code: string): Observable<void> {
    return this.http
      .post<unknown>(
        '/auth/mfa/totp/verify',
        { mfa_token: mfaToken, code },
        { context: internalApiContext() },
      )
      .pipe(map(() => undefined));
  }

  verifyRecoveryCode(mfaToken: string, code: string): Observable<void> {
    return this.http
      .post<unknown>(
        '/auth/mfa/recovery-code/verify',
        { mfa_token: mfaToken, code },
        { context: internalApiContext() },
      )
      .pipe(map(() => undefined));
  }

  verifyPasskey(mfaToken: string, assertion: WebAuthnAssertionPayload): Observable<void> {
    return this.http
      .post<unknown>(
        '/auth/mfa/webauthn/verify',
        { mfa_token: mfaToken, ...assertion },
        { context: internalApiContext() },
      )
      .pipe(map(() => undefined));
  }

  inspectInvitation(token: string): Observable<InvitationInspection> {
    return this.http
      .post<{ readonly data: InvitationInspection }>(
        '/auth/invitations/inspect',
        { token },
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data));
  }

  completeInvitation(payload: CompleteInvitationRequest): Observable<CompleteInvitationResult> {
    return this.http
      .post<{ readonly data: CompleteInvitationResult }>('/auth/invitations/complete', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => response.data));
  }

  requestRecovery(email: string): Observable<void> {
    return this.http
      .post<unknown>('/auth/recovery/password', { email }, { context: internalApiContext() })
      .pipe(map(() => undefined));
  }

  completeRecovery(payload: CompleteRecoveryRequest): Observable<void> {
    return this.http
      .post<unknown>('/auth/recovery/password/complete', payload, {
        context: internalApiContext(),
      })
      .pipe(map(() => undefined));
  }

  logout(): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      '/auth/logout',
      {},
      { context: internalApiContext() },
    );
  }
}

function validateLoginResponse(response: LoginResponse): LoginResponse {
  const factors = response?.data?.allowed_factors;
  if (
    typeof response?.data?.mfa_token !== 'string' ||
    typeof response.data.expires_at !== 'string' ||
    !Array.isArray(factors) ||
    factors.some(
      (factor) => factor !== 'PASSKEY' && factor !== 'RECOVERY_CODE' && factor !== 'TOTP',
    )
  ) {
    throw new Error('INVALID_LOGIN_RESPONSE');
  }
  return response;
}
