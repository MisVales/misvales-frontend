import { resolveApiPaginationLink } from './api-pagination-link.util';

describe('resolveApiPaginationLink', () => {
  it('keeps only the expected API path and server-provided query', () => {
    expect(
      resolveApiPaginationLink(
        'https://api.example.test/api/v1/m02/roles?page=2',
        '/api/v1/m02/roles',
      ),
    ).toBe('/api/v1/m02/roles?page=2');
  });

  it('rejects links to a different resource', () => {
    expect(() =>
      resolveApiPaginationLink(
        'https://api.example.test/api/v1/m02/users?page=2',
        '/api/v1/m02/roles',
      ),
    ).toThrowError('INVALID_API_PAGINATION_LINK');
  });
});
