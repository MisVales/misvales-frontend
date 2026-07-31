import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';

import { ApplicationExperience, EffectiveAccess, RoleCode } from './session.store';

interface EffectiveContextDto {
  readonly user: SessionIdentityDto;
  readonly role: { readonly code: RoleCode; readonly name: string };
  readonly scope: { readonly type: 'BRANCH' | 'GLOBAL'; readonly branchId: string | null };
  readonly permissions: readonly string[];
  readonly experience: {
    readonly code: 'ADMIN' | 'DISTRIBUTOR_MOBILE' | 'TABLET';
    readonly layout: 'desktop' | 'mobile' | 'tablet';
    readonly homeRoute: string;
  };
  readonly session: {
    readonly id: string | null;
    readonly authenticatedAt: string;
    readonly assuranceLevel: string;
    readonly reauthenticatedUntil: string | null;
  };
  readonly contextVersion: number;
}

interface SessionIdentityDto {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly status: string;
}

@Injectable({ providedIn: 'root' })
export class ContextContractGateway {
  private readonly http = inject(HttpClient);

  load(): Observable<EffectiveAccess> {
    return this.http
      .get<{ readonly data: unknown }>('/auth/context', { context: internalApiContext() })
      .pipe(map((response) => mapEffectiveContext(response.data)));
  }
}

export function mapEffectiveContext(value: unknown): EffectiveAccess {
  if (!isEffectiveContextDto(value)) {
    throw new Error('INVALID_AUTH_CONTEXT_RESPONSE');
  }

  return {
    experience: experienceFrom(value.experience),
    permissions: new Set(value.permissions),
    role: value.role.code,
    scopeType: value.scope.type,
    branchId: value.scope.branchId,
    identity: {
      id: value.user.id,
      displayName: value.user.displayName,
      email: value.user.email,
      status: value.user.status,
    },
    sessionId: value.session.id,
  };
}

function experienceFrom(value: EffectiveContextDto['experience']): ApplicationExperience {
  const mapping: Readonly<
    Record<EffectiveContextDto['experience']['code'], ApplicationExperience>
  > = {
    ADMIN: 'administrativa',
    DISTRIBUTOR_MOBILE: 'distribuidora',
    TABLET: 'tableta',
  };
  return mapping[value.code];
}

function isEffectiveContextDto(value: unknown): value is EffectiveContextDto {
  if (!isRecord(value)) {
    return false;
  }
  const user = value['user'];
  const role = value['role'];
  const scope = value['scope'];
  const experience = value['experience'];
  const session = value['session'];
  const permissions = value['permissions'];
  return (
    isRecord(user) &&
    typeof user['id'] === 'string' &&
    typeof user['email'] === 'string' &&
    typeof user['displayName'] === 'string' &&
    typeof user['status'] === 'string' &&
    isRecord(role) &&
    isRoleCode(role['code']) &&
    isRecord(scope) &&
    (scope['type'] === 'BRANCH' || scope['type'] === 'GLOBAL') &&
    (typeof scope['branchId'] === 'string' || scope['branchId'] === null) &&
    Array.isArray(permissions) &&
    permissions.every((permission) => typeof permission === 'string') &&
    isRecord(experience) &&
    (experience['code'] === 'ADMIN' ||
      experience['code'] === 'TABLET' ||
      experience['code'] === 'DISTRIBUTOR_MOBILE') &&
    isRecord(session) &&
    (typeof session['id'] === 'string' || session['id'] === null)
  );
}

function isRoleCode(value: unknown): value is RoleCode {
  return (
    value === 'GENERAL_MANAGER' ||
    value === 'SUCURSAL_MANAGER' ||
    value === 'COORDINATOR' ||
    value === 'VERIFIER' ||
    value === 'ADMINISTRATOR' ||
    value === 'DISTRIBUTOR' ||
    value === 'CASHIER'
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
