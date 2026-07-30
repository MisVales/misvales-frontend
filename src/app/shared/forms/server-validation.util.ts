import { AbstractControl, FormGroup } from '@angular/forms';

import { ApiFieldErrors } from '@core/api/api-response.models';

export interface ServerValidationResult {
  readonly unassociated: ApiFieldErrors;
}

export function applyServerValidation(
  form: FormGroup,
  fields: ApiFieldErrors,
): ServerValidationResult {
  const unassociated: Record<string, readonly string[]> = {};

  for (const [name, messages] of Object.entries(fields)) {
    const control: AbstractControl | null = form.get(name);
    if (!control) {
      unassociated[name] = messages;
      continue;
    }

    control.setErrors({
      ...control.errors,
      server: messages,
    });
  }

  return { unassociated };
}
