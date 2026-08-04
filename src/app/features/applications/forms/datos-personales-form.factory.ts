import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { curpValidator } from '../validators/curp.validator';
import { rfcValidator } from '../validators/rfc.validator';

export class DatosPersonalesFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      first_last_name: ['', [Validators.required, Validators.maxLength(100)]],
      second_last_name: ['', [Validators.maxLength(100)]],
      curp: ['', [Validators.required, curpValidator()]],
      rfc: ['', [rfcValidator()]],
      birth_date: ['', [Validators.required]],
      birth_place: ['', [Validators.maxLength(100)]],
      birth_state: ['', [Validators.maxLength(50)]],
      birth_city: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      official_id_type: ['', [Validators.required]],
      official_id_number: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }
}
