import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthFlowStore } from '../state/auth-flow.store';

export const mfaChallengeGuard: CanActivateFn = () =>
  challengeIsActive(inject(AuthFlowStore)) ? true : inject(Router).parseUrl('/acceso');

export const recoveryTokenGuard: CanActivateFn = (route) => {
  const flow = inject(AuthFlowStore);
  const token = route.queryParamMap.get('token');
  if (token) {
    flow.setRecoveryToken(token);
    return true;
  }
  return flow.recoveryToken() ? true : inject(Router).parseUrl('/acceso/recuperar');
};

function challengeIsActive(flow: AuthFlowStore): boolean {
  const challenge = flow.challenge();
  if (!challenge || Date.parse(challenge.expiresAt) <= Date.now()) {
    flow.clearChallenge();
    return false;
  }
  return true;
}
