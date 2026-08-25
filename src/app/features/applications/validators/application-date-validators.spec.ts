import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { adultBirthDateValidator, maxAdultBirthDate } from './adult-birth-date.validator';
import { positiveDecimalStringValidator } from './decimal-string.validator';
import { notFutureDateValidator } from './not-future-date.validator';

describe('application date validators', () => {
  it('rejects implausibly old birth dates while retaining the adult rule', () => {
    const control = new FormControl('0800-01-01', { validators: [adultBirthDateValidator] });

    expect(control.errors).toEqual({ birthDateTooEarly: true });
  });

  it('uses the local calendar date for the adult date limit', () => {
    expect(maxAdultBirthDate(new Date(2026, 7, 20, 23, 30))).toBe('2008-08-20');
  });

  it('rejects an employment start date after today and clears it when corrected', () => {
    const control = new FormControl('2999-01-01', { validators: [notFutureDateValidator] });

    expect(control.errors).toEqual({ dateAfterToday: true });

    control.setValue('2020-01-01');

    expect(control.errors).toBeNull();
  });

  it('identifies a non-positive property measurement with a field-specific error key', () => {
    const control = new FormControl('-20', { validators: [positiveDecimalStringValidator()] });

    expect(control.errors).toEqual({ negativeDecimal: true });

    control.setValue('20');

    expect(control.errors).toBeNull();
  });
});
