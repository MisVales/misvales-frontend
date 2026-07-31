const LOCAL_ORIGIN = 'https://misvales.invalid';

export function resolveApiPaginationLink(link: string, expectedPath: string): string {
  let parsed: URL;
  try {
    parsed = new URL(link, `${LOCAL_ORIGIN}${expectedPath}`);
  } catch {
    throw new Error('INVALID_API_PAGINATION_LINK');
  }
  if (parsed.pathname !== expectedPath || parsed.hash) {
    throw new Error('INVALID_API_PAGINATION_LINK');
  }
  return `${parsed.pathname}${parsed.search}`;
}
