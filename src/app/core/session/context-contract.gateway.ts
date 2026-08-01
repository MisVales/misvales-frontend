import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { EffectiveAccess } from './session.store';

export const AUTH_CONTEXT_CONTRACT_UNAVAILABLE = 'AUTH_CONTEXT_CONTRACT_UNAVAILABLE';

@Injectable({ providedIn: 'root' })
export class ContextContractGateway {
  load(): Observable<EffectiveAccess> {
    return throwError(() => new Error(AUTH_CONTEXT_CONTRACT_UNAVAILABLE));
  }
}
