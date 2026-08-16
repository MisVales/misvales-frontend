import { MisvalesDateTimePipe } from './misvales-date-time.pipe';

describe('MisvalesDateTimePipe', () => {
  const pipe = new MisvalesDateTimePipe();

  it('formats dates in the America/Monterrey timezone', () => {
    const result = pipe.transform('2026-01-15T12:00:00Z');
    expect(result).toContain('15 ene 2026');
    expect(result).toMatch(/06:00|6:00/);
  });

  it('returns a neutral placeholder for invalid values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('not-a-date')).toBe('—');
  });
});
