import { describe, expect, it } from 'vitest';
import { canStartScheduledVisit, nextAssignableSlot } from './visit-schedule-policy';

describe('visit schedule policy', () => {
  it('moves the earliest assignment to the next 15-minute slot', () => {
    expect(nextAssignableSlot(new Date(2026, 7, 24, 12, 0))).toEqual(
      new Date(2026, 7, 24, 12, 15),
    );
    expect(nextAssignableSlot(new Date(2026, 7, 24, 12, 1))).toEqual(
      new Date(2026, 7, 24, 12, 15),
    );
    expect(nextAssignableSlot(new Date(2026, 7, 24, 12, 15))).toEqual(
      new Date(2026, 7, 24, 12, 30),
    );
  });

  it('allows starting 15 minutes early and at any later time that day', () => {
    const scheduled = new Date(2026, 7, 24, 13, 0).toISOString();

    expect(canStartScheduledVisit(scheduled, new Date(2026, 7, 24, 12, 44, 59))).toBe(false);
    expect(canStartScheduledVisit(scheduled, new Date(2026, 7, 24, 12, 45))).toBe(true);
    expect(canStartScheduledVisit(scheduled, new Date(2026, 7, 24, 18, 30))).toBe(true);
    expect(canStartScheduledVisit(scheduled, new Date(2026, 7, 25, 0, 1))).toBe(false);
  });
});
