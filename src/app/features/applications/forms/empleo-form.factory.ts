import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { rangoFechasValidator } from '../validators/rango-fechas.validator';
import { notFutureDateValidator } from '../validators/not-future-date.validator';

export class EmpleoFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      employer_name: ['', [Validators.required, Validators.maxLength(150)]],
      job_title: ['', [Validators.required, Validators.maxLength(100)]],
      started_at: ['', [Validators.required, notFutureDateValidator]],
      ended_at: [''],
      is_current: [false],
      reference_payload: [null],
      details_payload: [null]
    }, { validators: rangoFechasValidator('started_at', 'ended_at') });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
