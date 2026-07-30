import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { EffectiveAccess } from './session.store';

export const CONTEXT_CONTRACT_PENDING = 'CONTEXT_CONTRACT_PENDING';

@Injectable({ providedIn: 'root' })
export class ContextContractGateway {
  load(): Observable<EffectiveAccess> {
    return throwError(
      () =>
        new Error(
          `${CONTEXT_CONTRACT_PENDING}: GET /api/v1/auth/context does not define its response fields.`,
        ),
    );
  }
}
