import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { ExperiencePolicyService } from '@core/config/experience/experience-policy.service';

function evaluate(url: string): boolean | ReturnType<Router['createUrlTree']> {
  const router = inject(Router);
  const policy = inject(ExperiencePolicyService);
  const decision = policy.decision();

  if (decision.kind === 'allowed') return true;

  policy.rememberReturnUrl(url);
  return router.createUrlTree(['/auth/login']);
}

export const experienceGuard: CanActivateFn = (_route, state) => evaluate(state.url);
export const experienceChildGuard: CanActivateChildFn = (_route, state) => evaluate(state.url);
