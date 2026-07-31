import { Injectable, inject, signal } from '@angular/core';

import { SessionStore } from '@core/session/session.store';
import {
  CompleteInvitationResult,
  InvitationInspection,
  MfaChallenge,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthFlowStore {
  private readonly session = inject(SessionStore);
  private readonly challengeState = signal<MfaChallenge | null>(null);
  private readonly invitationState = signal<InvitationInspection | null>(null);
  private readonly recoveryTokenState = signal<string | null>(null);
  private readonly oneTimeCodesState = signal<readonly string[] | null>(null);

  readonly challenge = this.challengeState.asReadonly();
  readonly invitation = this.invitationState.asReadonly();
  readonly recoveryToken = this.recoveryTokenState.asReadonly();
  readonly oneTimeCodes = this.oneTimeCodesState.asReadonly();

  constructor() {
    this.session.registerCleanup(() => this.clearAll());
  }

  setChallenge(challenge: MfaChallenge): void {
    this.challengeState.set(challenge);
  }

  setInvitation(invitation: InvitationInspection): void {
    this.invitationState.set(invitation);
  }

  setRecoveryToken(token: string): void {
    this.recoveryTokenState.set(token);
  }

  captureInvitationResult(result: CompleteInvitationResult): void {
    this.oneTimeCodesState.set(result.recovery_codes ?? null);
  }

  clearChallenge(): void {
    this.challengeState.set(null);
  }

  clearInvitation(): void {
    this.invitationState.set(null);
    this.oneTimeCodesState.set(null);
  }

  clearRecovery(): void {
    this.recoveryTokenState.set(null);
  }

  clearAll(): void {
    this.clearChallenge();
    this.clearInvitation();
    this.clearRecovery();
  }
}
