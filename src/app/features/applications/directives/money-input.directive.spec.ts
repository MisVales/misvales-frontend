import { describe, expect, it } from 'vitest';
import { formatMoneyValue, normalizeMoneyValue } from './money-input.directive';

describe('money input formatting', () => {
  it('shows thousands separators while preserving the canonical API decimal', () => {
    const rawValue = normalizeMoneyValue('50,000.50');

    expect(rawValue).toBe('50000.50');
    expect(formatMoneyValue(rawValue)).toBe('50,000.50');
  });

  it('normalizes a cents-only entry without changing its numeric meaning', () => {
    expect(normalizeMoneyValue('.50')).toBe('0.50');
    expect(formatMoneyValue('0.50')).toBe('0.50');
  });
});
