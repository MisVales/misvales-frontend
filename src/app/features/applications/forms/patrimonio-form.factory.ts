import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { decimalStringValidator } from '../validators/decimal-string.validator';

export class PatrimonioFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      entry_type: ['', [Validators.required]], // ASSET, LIABILITY, ACTIVE_COMMITMENT
      name: ['', [Validators.required, Validators.maxLength(100)]],
      amount: ['', [Validators.required, decimalStringValidator()]], // Captured as decimal string
      outstanding_balance: ['', [decimalStringValidator()]], // Optional
      monthly_payment: ['', [decimalStringValidator()]], // Optional
      is_active: [true],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
