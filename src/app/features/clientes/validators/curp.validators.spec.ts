import { FormControl } from '@angular/forms';
import { curpValidator } from './curp.validators';

describe('CurpValidator', () => {
  const validator = curpValidator();

  it('should return null if empty', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('should return error for invalid length', () => {
    expect(validator(new FormControl('SHORT'))).toEqual({ curpInvalid: true });
  });

  it('should return error for lowercase characters', () => {
    expect(validator(new FormControl('pelj800101hjcXXXXX'))).toEqual({ curpInvalid: true });
  });

  it('should return null for valid CURP', () => {
    expect(validator(new FormControl('PELJ800101HJCXXA0'))).toBeNull();
  });
});
