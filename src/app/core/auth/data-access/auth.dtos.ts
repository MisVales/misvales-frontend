export interface LoginReq {
  email: string;
  password: string;
  turnstile_token?: string | null;
}

export type MfaMethod = 'PASSKEY' | 'RECOVERY_CODE' | 'TOTP';

export interface LoginRes {
  message?: string;
  mfa_challenge_token?: string;
  expires_in?: number;
  access_token?: string;
  available_mfa?: MfaMethod[];
  next_step?: 'PASSKEY';
  user?: {
    id: number | string;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    state?: string;
  };
  scopes?: Array<{
    branch_id: string | null;
    branch_name?: string | null;
    branch_code?: string | null;
    role_name: string;
    role: string;
    permissions: string[];
  }>;
  effective_permissions?: string[];
  access_context?: { vpn: boolean };
  capabilities?: { manager_actions: boolean };
}

export interface MfaReq {
  mfa_challenge_token: string;
  totp_code?: string;
  recovery_code?: string;
}

export interface RecoverReq {
  email: string;
  turnstile_token?: string | null;
}

export interface ResetPwdReq {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface InspectInvitationReq {
  token: string;
}

export interface InspectInvitationRes {
  exchange_token: string;
  step?: 'setup' | 'passkey';
  development_mfa_bypass?: boolean;
  user: {
    name: string;
    email: string;
    roles?: string[];
  };
  totp_setup?: {
    qr_code_url: string;
    secret?: string;
    secret_key?: string;
  };
}

export interface SetupInvitationReq {
  exchange_token: string;
  password?: string;
  password_confirmation?: string;
  totp_code?: string;
}

export interface SetupInvitationRes {
  recovery_codes: string[];
  development_mfa_bypass?: boolean;
}

export interface CompleteInvitationReq {
  exchange_token: string;
  codes_safeguarded: boolean;
}

export interface ResendInvitationReq {
  token: string;
}

export interface ResendInvitationRes {
  message: string;
}

export interface PasskeySetupReq {
  exchange_token: string;
}

export interface PasskeyRegisterReq {
  exchange_token: string;
  clientDataJSON: string;
  attestationObject: string;
}

export interface PasskeyVerifyReq {
  mfa_challenge_token: string;
  id: string;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
}

export interface ApiMessageRes {
  message: string;
}
