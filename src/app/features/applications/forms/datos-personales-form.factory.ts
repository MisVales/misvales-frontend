import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { curpValidator } from '../validators/curp.validator';
import { rfcValidator } from '../validators/rfc.validator';
import { adultBirthDateValidator } from '../validators/adult-birth-date.validator';
import { personNameValidator } from '../validators/person-name.validator';

export class DatosPersonalesFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      nationality: ['MEXICAN', [Validators.required]],
      first_name: ['', [Validators.required, Validators.maxLength(100), personNameValidator]],
      first_last_name: ['', [Validators.required, Validators.maxLength(100), personNameValidator]],
      second_last_name: ['', [Validators.maxLength(100), personNameValidator]],
      curp: ['', [Validators.required, Validators.maxLength(18), curpValidator()]],
      rfc: ['', [Validators.maxLength(13), rfcValidator()]],
      birth_country: ['MX', [Validators.required, Validators.maxLength(2)]],
      birth_date: ['', [Validators.required, adultBirthDateValidator]],
      birth_state: ['', [Validators.required, Validators.maxLength(50)]],
      birth_city: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      // Sólo se solicita para personas extranjeras; el componente agrega `required`
      // cuando se selecciona esa nacionalidad.
      identification_country: ['MX', [Validators.maxLength(2)]],
      official_id_type: ['', [Validators.required]],
      official_id_number: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      evidence_uploaded: [false, [Validators.requiredTrue]] // Estado derivado de la evidencia privada ya almacenada
    });
  }
}
