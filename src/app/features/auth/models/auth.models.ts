import { ApplicationExperience } from '@core/session/session.store';

export type MfaFactor = 'PASSKEY' | 'RECOVERY_CODE' | 'TOTP';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly application: ApplicationExperience;
}

export interface LoginResponse {
  readonly message: string;
  readonly data: {
    readonly mfa_token: string;
    readonly expires_at: string;
    readonly allowed_factors: readonly MfaFactor[];
    readonly webauthn_challenge: string | null;
  };
}

export interface MfaChallenge {
  readonly application: ApplicationExperience;
  readonly mfaToken: string;
  readonly expiresAt: string;
  readonly allowedFactors: readonly MfaFactor[];
  readonly webauthnChallenge: string | null;
}

export type RecoveryFactorType = 'PASSKEY_AUTHORIZATION' | 'RECOVERY_CODE' | 'TOTP';

export interface InvitationInspection {
  readonly exchange_token: string;
  readonly expires_at: string;
  readonly purpose: string;
  readonly confirmation_pending: boolean;
  readonly account: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
  };
}

export interface InvitationMfa {
  readonly type: 'PASSKEY' | 'TOTP';
  readonly secret?: string;
  readonly code?: string;
  readonly credential_identifier?: string;
  readonly public_key?: string;
  readonly attestation_token?: string;
}

export interface CompleteInvitationRequest {
  readonly exchange_token: string;
  readonly password?: string;
  readonly password_confirmation?: string;
  readonly recovery_codes_confirmed?: boolean;
  readonly mfa?: InvitationMfa;
}

export interface CompleteInvitationResult {
  readonly confirmation_required: boolean;
  readonly login_required: boolean;
  readonly recovery_codes?: readonly string[];
}

export interface CompleteRecoveryRequest {
  readonly token: string;
  readonly password: string;
  readonly password_confirmation: string;
  readonly factor_type: RecoveryFactorType;
  readonly factor_value: string;
  readonly mfa?: InvitationMfa;
}
