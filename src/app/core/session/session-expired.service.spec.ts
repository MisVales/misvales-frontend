import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SessionExpiredService } from './session-expired.service';

describe('SessionExpiredService', () => {
  it('opens only once when several requests report an expired session', () => {
    const service = TestBed.inject(SessionExpiredService);

    expect(service.open()).toBe(true);
    expect(service.open()).toBe(false);
    expect(service.isOpen()).toBe(true);

    service.close();

    expect(service.isOpen()).toBe(false);
  });
});
