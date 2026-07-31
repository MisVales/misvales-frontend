import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  COMMAND_CONTEXT,
  createCommandContext,
  internalApiContext,
} from '@core/api/api-request.context';
import { resolveApiPaginationLink } from '@core/api/api-pagination-link.util';
import { ApiPaginatedResponse } from '@core/api/api-response.models';

import {
  AccountRequestDto,
  CreateAccountPayload,
  CreateAccountRequestPayload,
} from '../models/accounts.models';

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private readonly http = inject(HttpClient);

  accountRequests(
    navigationUrl: string | null = null,
  ): Observable<ApiPaginatedResponse<AccountRequestDto>> {
    const url = navigationUrl
      ? resolveApiPaginationLink(navigationUrl, '/api/v1/account-requests')
      : '/account-requests';
    return this.http
      .get<unknown>(url, { context: internalApiContext() })
      .pipe(map(normalizeAccountRequests));
  }

  createRequest(
    payload: CreateAccountRequestPayload,
    command: HttpContext,
  ): Observable<AccountRequestDto> {
    return this.http
      .post<{ readonly data: AccountRequestDto }>('/account-requests', payload, {
        context: command,
      })
      .pipe(map((response) => response.data));
  }

  decide(
    id: string,
    decision: 'approve' | 'reject',
    reason: string,
    reauthToken: string,
  ): Observable<AccountRequestDto> {
    return this.http
      .post<{ readonly data: AccountRequestDto }>(
        `/account-requests/${encodeURIComponent(id)}/${decision}`,
        { reason, reauth_token: reauthToken },
        { context: internalApiContext() },
      )
      .pipe(map((response) => response.data));
  }

  createAccount(payload: CreateAccountPayload): Observable<unknown> {
    return this.http.post<unknown>('/accounts', payload, {
      context: internalApiContext(),
    });
  }

  newIdempotentCommand(): HttpContext {
    return internalApiContext().set(COMMAND_CONTEXT, createCommandContext({ idempotency: true }));
  }
}

function normalizeAccountRequests(value: unknown): ApiPaginatedResponse<AccountRequestDto> {
  if (!isRecord(value) || !isRecord(value['data']) || !Array.isArray(value['data']['data'])) {
    throw new Error('INVALID_ACCOUNT_REQUESTS_RESPONSE');
  }
  const paginator = value['data'];
  return {
    data: paginator['data'] as readonly AccountRequestDto[],
    links: {
      prev: typeof paginator['prev_page_url'] === 'string' ? paginator['prev_page_url'] : null,
      next: typeof paginator['next_page_url'] === 'string' ? paginator['next_page_url'] : null,
    },
    meta: {
      current_page: numberOr(paginator['current_page'], 1),
      per_page: numberOr(paginator['per_page'], 25),
      total: numberOr(paginator['total'], 0),
    },
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
