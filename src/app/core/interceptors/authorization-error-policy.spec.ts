import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { shouldEndSessionForHttpStatus } from './error-handling.interceptor';

describe('authorization error policy', () => {
  it('ends the local session for unauthenticated or expired-session responses', () => {
    expect(shouldEndSessionForHttpStatus(401)).toBe(true);
    expect(shouldEndSessionForHttpStatus(419)).toBe(true);
  });

  it('preserves the local session for forbidden responses', () => {
    expect(shouldEndSessionForHttpStatus(403)).toBe(false);
  });
});
