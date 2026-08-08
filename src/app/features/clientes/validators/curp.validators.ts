import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function curpValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    // Convert to uppercase visually/internally via form logic usually, 
    // but the validator should check if it's 18 chars and matches regex.
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
    
    // We check against uppercase version to be tolerant if form didn't format yet, 
    // or strictly require uppercase depending on implementation. Let's be strict.
    if (!curpRegex.test(value)) {
      return { curpInvalid: true };
    }
    
    return null;
  };
}
