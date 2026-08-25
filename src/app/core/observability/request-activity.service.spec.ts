import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestActivityService } from './request-activity.service';

describe('RequestActivityService', () => {
  let service: RequestActivityService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T10:00:00Z'));
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestActivityService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('avoids flashing for requests that complete quickly', () => {
    const complete = service.begin();
    expect(service.pendingCount()).toBe(1);

    complete();
    vi.advanceTimersByTime(500);

    expect(service.pendingCount()).toBe(0);
    expect(service.visible()).toBe(false);
  });

  it('keeps the indicator stable until concurrent work finishes', () => {
    const completeFirst = service.begin();
    const completeSecond = service.begin();

    vi.advanceTimersByTime(160);
    expect(service.visible()).toBe(true);

    completeFirst();
    expect(service.pendingCount()).toBe(1);
    expect(service.visible()).toBe(true);

    completeSecond();
    vi.advanceTimersByTime(240);
    expect(service.pendingCount()).toBe(0);
    expect(service.visible()).toBe(false);
  });
});
