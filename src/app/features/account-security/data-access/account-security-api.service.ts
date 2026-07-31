import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { ApiMessageResponse, ApiPaginatedResponse } from '@core/api/api-response.models';

import {
  AuthSessionDto,
  PasskeyChallenge,
  PasskeyReauthentication,
  PasswordTotpReauthentication,
  SecurityAlertDto,
  TemporaryAuthorization,
  TotpSetup,
} from '../models/account-security.models';

@Injectable({ providedIn: 'root' })
export class AccountSecurityApiService {
  private readonly http = inject(HttpClient);

  reauthenticate(payload: PasswordTotpReauthentication): Observable<TemporaryAuthorization> {
    return this.http
      .post<{ readonly data: TemporaryAuthorization }>('/auth/reauthenticate', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => response.data));
  }

  beginPasskeyReauthentication(payload: PasskeyReauthentication): Observable<PasskeyChallenge> {
    return this.http
      .post<{ readonly data: PasskeyChallenge }>('/auth/reauthenticate', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => response.data));
  }

  finishPasskeyReauthentication(
    payload: PasskeyReauthentication,
  ): Observable<TemporaryAuthorization> {
    return this.http
      .post<{ readonly data: TemporaryAuthorization }>('/auth/reauthenticate', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => response.data));
  }

  changePassword(
    password: string,
    passwordConfirmation: string,
    reauthToken: string,
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      '/auth/password/change',
      {
        password,
        password_confirmation: passwordConfirmation,
        reauth_token: reauthToken,
      },
      { context: internalApiContext() },
    );
  }

  setupTotp(): Observable<TotpSetup> {
    return this.http
      .post<{ readonly data: TotpSetup }>(
        '/auth/mfa/totp/setup',
        {},
        {
          context: internalApiContext(),
        },
      )
      .pipe(map((response) => response.data));
  }

  confirmTotp(secret: string, code: string, reauthToken: string): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      '/auth/mfa/totp/confirm',
      { secret, code, reauth_token: reauthToken },
      { context: internalApiContext() },
    );
  }

  passkeyOptions(): Observable<PublicKeyCredentialCreationOptionsJSON> {
    return this.http
      .post<{ readonly data: PublicKeyCredentialCreationOptionsJSON }>(
        '/auth/mfa/passkeys/options',
        {},
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data));
  }

  registerPasskey(
    clientDataJSON: string,
    attestationObject: string,
    reauthToken: string,
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      '/auth/mfa/passkeys',
      { clientDataJSON, attestationObject, reauth_token: reauthToken },
      { context: internalApiContext() },
    );
  }

  regenerateRecoveryCodes(reauthToken: string): Observable<readonly string[]> {
    return this.http
      .post<{ readonly data: { readonly recovery_codes: readonly string[] } }>(
        '/auth/mfa/recovery-codes/regenerate',
        { reauth_token: reauthToken },
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data.recovery_codes));
  }

  sessions(): Observable<readonly AuthSessionDto[]> {
    return this.http
      .get<{ readonly data: readonly AuthSessionDto[] }>('/auth/sessions', {
        context: internalApiContext(),
      })
      .pipe(map((response) => response.data));
  }

  revokeSession(sessionId: string, reauthToken: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
      body: { reauth_token: reauthToken },
      context: internalApiContext(),
      headers: new HttpHeaders({ 'X-Reauthentication-Token': reauthToken }),
    });
  }

  revokeOtherSessions(reauthToken: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>('/auth/sessions/others', {
      body: { reauth_token: reauthToken },
      context: internalApiContext(),
      headers: new HttpHeaders({ 'X-Reauthentication-Token': reauthToken }),
    });
  }

  alerts(): Observable<ApiPaginatedResponse<SecurityAlertDto>> {
    return this.http
      .get<unknown>('/security/alerts', { context: internalApiContext() })
      .pipe(map((response) => normalizeAlerts(response)));
  }

  acknowledgeAlert(id: string): Observable<SecurityAlertDto> {
    return this.http
      .post<{ readonly data: SecurityAlertDto }>(
        `/security/alerts/${encodeURIComponent(id)}/acknowledge`,
        {},
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data));
  }

  requestAlertAction(id: string): Observable<SecurityAlertDto> {
    return this.http
      .post<{ readonly data: SecurityAlertDto }>(
        `/security/alerts/${encodeURIComponent(id)}/request-action`,
        {},
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data));
  }
}

interface PublicKeyCredentialCreationOptionsJSON {
  readonly challenge: string;
  readonly rp: PublicKeyCredentialRpEntity;
  readonly user: Omit<PublicKeyCredentialUserEntity, 'id'> & { readonly id: string };
  readonly pubKeyCredParams: readonly PublicKeyCredentialParameters[];
  readonly timeout?: number;
  readonly attestation?: AttestationConveyancePreference;
  readonly authenticatorSelection?: AuthenticatorSelectionCriteria;
  readonly excludeCredentials?: readonly (Omit<PublicKeyCredentialDescriptor, 'id'> & {
    readonly id: string;
  })[];
}

function normalizeAlerts(value: unknown): ApiPaginatedResponse<SecurityAlertDto> {
  if (!isRecord(value)) {
    throw new Error('INVALID_SECURITY_ALERTS_RESPONSE');
  }
  const nested = value['data'];
  if (isRecord(nested) && Array.isArray(nested['data'])) {
    return {
      data: nested['data'] as readonly SecurityAlertDto[],
      links: {
        prev: typeof nested['prev_page_url'] === 'string' ? nested['prev_page_url'] : null,
        next: typeof nested['next_page_url'] === 'string' ? nested['next_page_url'] : null,
      },
      meta: {
        current_page: numberOr(nested['current_page'], 1),
        per_page: numberOr(nested['per_page'], 25),
        total: numberOr(nested['total'], 0),
      },
    };
  }
  if (Array.isArray(nested) && isRecord(value['links']) && isRecord(value['meta'])) {
    return value as unknown as ApiPaginatedResponse<SecurityAlertDto>;
  }
  throw new Error('INVALID_SECURITY_ALERTS_RESPONSE');
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
