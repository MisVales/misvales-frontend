import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { decimalStringValidator } from '../validators/decimal-string.validator';

export class CreditoComercialFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      company_name: ['', [Validators.required, Validators.maxLength(150)]],
      credit_limit: ['', [Validators.required, decimalStringValidator()]], // Captured as string
      is_current: [true],
      proof_type: ['', [Validators.required]],
      proof_reference: ['', [Validators.maxLength(250)]],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
