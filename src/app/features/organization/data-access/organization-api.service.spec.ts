import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { OrganizationApiService } from './organization-api.service';

describe('OrganizationApiService', () => {
  let api: OrganizationApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(OrganizationApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses only the documented user search and page query parameters', async () => {
    const promise = firstValueFrom(api.list('users', 'Persona', 2));
    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/v1/m02/users' &&
        candidate.params.get('search') === 'Persona' &&
        candidate.params.get('page') === '2',
    );
    expect(request.request.params.keys().sort()).toEqual(['page', 'search']);
    request.flush({
      data: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          name: 'Persona de prueba',
          email: 'persona@example.test',
          status: 'ACTIVE',
        },
      ],
      links: { prev: null, next: null },
      meta: { current_page: 2, per_page: 15, total: 1 },
    });
    const result = await promise;
    expect(result.data[0].title).toBe('Persona de prueba');
  });

  it('follows only pagination links for the same non-user resource', async () => {
    const promise = firstValueFrom(
      api.list('roles', '', 1, 'https://api.example.test/api/v1/m02/roles?page=2'),
    );
    const request = http.expectOne('/api/v1/m02/roles?page=2');
    expect(request.request.params.keys()).toEqual([]);
    request.flush({
      data: [{ id: 2, name: 'Coordinador', code: 'COORDINATOR' }],
      links: { prev: '/api/v1/m02/roles?page=1', next: null },
      meta: { current_page: 2, per_page: 15, total: 16 },
    });
    expect((await promise).meta.current_page).toBe(2);
  });

  it('sends assignment timestamps with exact field names', async () => {
    const payload = {
      distributor_public_id: '00000000-0000-4000-8000-000000000001',
      coordinator_public_id: '00000000-0000-4000-8000-000000000002',
      branch_public_id: '00000000-0000-4000-8000-000000000003',
      starts_at: '2026-07-30T18:00:00.000Z',
      ends_at: null,
      reason: null,
    };
    const promise = firstValueFrom(api.createAssignment(payload));
    const request = http.expectOne('/api/v1/m02/assignments');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { public_id: 'assignment-id', starts_at: payload.starts_at } });
    await promise;
  });

  it('covers public read contracts and scope/assignment mutations', async () => {
    const detail = firstValueFrom(api.detail('branches', 'branch-id'));
    http
      .expectOne('/api/v1/m02/branches/branch-id')
      .flush({ data: { public_id: 'branch-id', name: 'Centro', is_active: true } });
    await detail;

    const roleDetail = firstValueFrom(api.detail('roles', '2'));
    http.expectOne('/api/v1/m02/roles/2').flush({
      data: {
        id: 2,
        name: 'Coordinador',
        permissions: [{ id: 1, code: 'auth.context.read' }],
      },
    });
    expect((await roleDetail).detail['permissions']).toBe('auth.context.read');

    const users = firstValueFrom(api.users('User'));
    http
      .expectOne((request) => request.url === '/api/v1/m02/users')
      .flush({
        data: [
          {
            id: 'user-id',
            name: 'User',
            email: 'user@example.test',
            role: { code: 'COORDINATOR' },
            scope: { branch_id: 'branch-id' },
          },
        ],
        links: { prev: null, next: null },
        meta: { current_page: 1, per_page: 15, total: 1 },
      });
    expect((await users)[0].roleCode).toBe('COORDINATOR');

    const branches = firstValueFrom(api.branches());
    http
      .expectOne('/api/v1/m02/branches')
      .flush({ data: [{ public_id: 'branch-id', name: 'Centro' }] });
    await branches;

    const roles = firstValueFrom(api.roles());
    http
      .expectOne('/api/v1/m02/roles')
      .flush({ data: [{ id: 2, name: 'Coordinador', code: 'COORDINATOR' }] });
    await roles;

    const scope = firstValueFrom(
      api.createScope({
        user_public_id: 'user-id',
        role_id: 2,
        scope_type: 'GLOBAL',
        branch_public_id: null,
      }),
    );
    http
      .expectOne('/api/v1/m02/scopes')
      .flush({ data: { public_id: 'scope-id', scope_type: 'GLOBAL' } });
    await scope;

    const close = firstValueFrom(api.closeAssignment('assignment-id'));
    http.expectOne('/api/v1/m02/assignments/assignment-id').flush({ message: 'Cerrada.' });
    await close;

    const update = firstValueFrom(
      api.updateAssignment('assignment-id', {
        ends_at: '2026-08-01T12:00:00.000Z',
        reason: 'Cambio autorizado',
      }),
    );
    const updateRequest = http.expectOne('/api/v1/m02/assignments/assignment-id');
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      ends_at: '2026-08-01T12:00:00.000Z',
      reason: 'Cambio autorizado',
    });
    updateRequest.flush({
      data: {
        public_id: 'assignment-id',
        ends_at: '2026-08-01T12:00:00.000Z',
      },
    });
    await update;
  });
});
