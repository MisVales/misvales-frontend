import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { resolveApiPaginationLink } from '@core/api/api-pagination-link.util';
import { ApiPaginatedResponse } from '@core/api/api-response.models';
import { toHttpParams } from '@core/api/query-params.util';

import {
  BranchOption,
  CreateAssignmentRequest,
  CreateScopeRequest,
  OrganizationRecord,
  OrganizationResource,
  OrganizationUserOption,
  RoleOption,
  UpdateAssignmentRequest,
} from '../models/organization.models';

@Injectable({ providedIn: 'root' })
export class OrganizationApiService {
  private readonly http = inject(HttpClient);

  list(
    resource: OrganizationResource,
    search = '',
    page = 1,
    navigationUrl: string | null = null,
  ): Observable<ApiPaginatedResponse<OrganizationRecord>> {
    const params = resource === 'users' ? toHttpParams({ search, page }) : undefined;
    const endpoint = `/m02/${resource}`;
    const url =
      resource !== 'users' && navigationUrl
        ? resolveApiPaginationLink(navigationUrl, `/api/v1${endpoint}`)
        : endpoint;
    return this.http
      .get<unknown>(url, {
        context: internalApiContext(),
        params,
      })
      .pipe(map((response) => normalizePaginated(response, resource)));
  }

  detail(
    resource: 'assignments' | 'branches' | 'roles' | 'users',
    id: string,
  ): Observable<OrganizationRecord> {
    return this.http
      .get<{ readonly data: unknown }>(`/m02/${resource}/${encodeURIComponent(id)}`, {
        context: internalApiContext(),
      })
      .pipe(map((response) => toOrganizationRecord(response.data, resource)));
  }

  users(search = ''): Observable<readonly OrganizationUserOption[]> {
    return this.http
      .get<unknown>('/m02/users', {
        context: internalApiContext(),
        params: toHttpParams({ search, page: 1 }),
      })
      .pipe(map((response) => extractItems(response).map(toUserOption)));
  }

  branches(): Observable<readonly BranchOption[]> {
    return this.http.get<unknown>('/m02/branches', { context: internalApiContext() }).pipe(
      map((response) =>
        extractItems(response).map((item) => ({
          id: stringValue(item, ['public_id', 'id']),
          name: stringValue(item, ['name']),
        })),
      ),
    );
  }

  roles(): Observable<readonly RoleOption[]> {
    return this.http.get<unknown>('/m02/roles', { context: internalApiContext() }).pipe(
      map((response) =>
        extractItems(response).map((item) => ({
          id: numberValue(item['id']),
          name: stringValue(item, ['name']),
          code: enumValue(item['code']),
        })),
      ),
    );
  }

  createScope(payload: CreateScopeRequest): Observable<OrganizationRecord> {
    return this.http
      .post<{ readonly data: unknown }>('/m02/scopes', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => toOrganizationRecord(response.data, 'scopes')));
  }

  createAssignment(payload: CreateAssignmentRequest): Observable<OrganizationRecord> {
    return this.http
      .post<{ readonly data: unknown }>('/m02/assignments', payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => toOrganizationRecord(response.data, 'assignments')));
  }

  updateAssignment(id: string, payload: UpdateAssignmentRequest): Observable<OrganizationRecord> {
    return this.http
      .put<{ readonly data: unknown }>(`/m02/assignments/${encodeURIComponent(id)}`, payload, {
        context: internalApiContext(),
      })
      .pipe(map((response) => toOrganizationRecord(response.data, 'assignments')));
  }

  closeAssignment(id: string): Observable<void> {
    return this.http
      .delete<unknown>(`/m02/assignments/${encodeURIComponent(id)}`, {
        context: internalApiContext(),
      })
      .pipe(map(() => undefined));
  }
}

function normalizePaginated(
  response: unknown,
  resource: OrganizationResource,
): ApiPaginatedResponse<OrganizationRecord> {
  if (!isRecord(response)) throw new Error('INVALID_ORGANIZATION_RESPONSE');
  const nested =
    isRecord(response['data']) && Array.isArray(response['data']['data'])
      ? response['data']
      : response;
  const items = Array.isArray(nested['data']) ? nested['data'] : [];
  return {
    data: items.map((item) => toOrganizationRecord(item, resource)),
    links: {
      prev: stringOrNull(nested['prev_page_url'] ?? valueAt(nested, 'links', 'prev')),
      next: stringOrNull(nested['next_page_url'] ?? valueAt(nested, 'links', 'next')),
    },
    meta: {
      current_page: numberOr(nested['current_page'] ?? valueAt(nested, 'meta', 'current_page'), 1),
      per_page: numberOr(nested['per_page'] ?? valueAt(nested, 'meta', 'per_page'), 15),
      total: numberOr(nested['total'] ?? valueAt(nested, 'meta', 'total'), items.length),
    },
  };
}

function extractItems(response: unknown): readonly Readonly<Record<string, unknown>>[] {
  if (!isRecord(response)) throw new Error('INVALID_ORGANIZATION_RESPONSE');
  const nested =
    isRecord(response['data']) && Array.isArray(response['data']['data'])
      ? response['data']['data']
      : response['data'];
  if (!Array.isArray(nested)) throw new Error('INVALID_ORGANIZATION_COLLECTION');
  return nested.filter(isRecord);
}

function toOrganizationRecord(value: unknown, resource: OrganizationResource): OrganizationRecord {
  if (!isRecord(value)) throw new Error('INVALID_ORGANIZATION_RECORD');
  const id = stringValue(value, ['public_id', 'id']);
  const detail = Object.fromEntries(
    Object.entries(value)
      .filter(([, field]) => isScalar(field))
      .map(([key, field]) => [key, enumValue(field)]),
  );
  if (resource === 'roles' && Array.isArray(value['permissions'])) {
    detail['permissions'] = value['permissions']
      .filter(isRecord)
      .map((permission) => stringValue(permission, ['code', 'name', 'id']))
      .filter(Boolean)
      .join(', ');
  }
  const title = titleFor(value, resource, id);
  return {
    id,
    title,
    subtitle: subtitleFor(value, resource),
    status: stringValue(value, ['status', 'state', 'scope_type', 'source_type'], 'Sin estado'),
    detail,
  };
}

function titleFor(
  value: Readonly<Record<string, unknown>>,
  resource: OrganizationResource,
  id: string,
): string {
  if (resource === 'assignments') {
    return nestedName(value['distributor']) || `Asignación ${id}`;
  }
  if (resource === 'scopes') {
    return nestedName(value['user']) || `Alcance ${id}`;
  }
  return stringValue(value, ['name', 'title', 'code'], `${resource} ${id}`);
}

function subtitleFor(
  value: Readonly<Record<string, unknown>>,
  resource: OrganizationResource,
): string {
  if (resource === 'users') return stringValue(value, ['email']);
  if (resource === 'assignments')
    return `Coordinador: ${nestedName(value['coordinator']) || 'No disponible'}`;
  if (resource === 'scopes') return `Rol: ${nestedName(value['role']) || 'No disponible'}`;
  return stringValue(value, ['city', 'code', 'description'], '');
}

function toUserOption(value: Readonly<Record<string, unknown>>): OrganizationUserOption {
  const role = isRecord(value['role']) ? value['role'] : null;
  const scope = isRecord(value['scope']) ? value['scope'] : null;
  return {
    id: stringValue(value, ['id', 'public_id']),
    name: stringValue(value, ['name']),
    email: stringValue(value, ['email']),
    roleCode: role ? stringOrNull(role['code']) : null,
    branchId: scope ? stringOrNull(scope['branch_id']) : null,
  };
}

function stringValue(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
  fallback = '',
): string {
  for (const key of keys) {
    const field = value[key];
    if (typeof field === 'string' || typeof field === 'number') return String(field);
    if (field instanceof Object && 'value' in field && typeof field.value === 'string') {
      return field.value;
    }
  }
  return fallback;
}

function enumValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return isRecord(value) && typeof value['value'] === 'string' ? value['value'] : '';
}

function nestedName(value: unknown): string {
  return isRecord(value) ? stringValue(value, ['name', 'email', 'public_id']) : '';
}

function valueAt(value: Readonly<Record<string, unknown>>, key: string, nested: string): unknown {
  return isRecord(value[key]) ? value[key][nested] : null;
}

function numberValue(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error('INVALID_NUMERIC_IDENTIFIER');
  return parsed;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function isScalar(value: unknown): value is boolean | number | string | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
