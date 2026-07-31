import { WebAuthnAssertionPayload } from '@core/security/webauthn.util';

export type CriticalAction =
  | 'account_requests.approve'
  | 'account_requests.create'
  | 'account_requests.reject'
  | 'accounts.create'
  | 'mfa.passkey.add'
  | 'mfa.passkey.remove'
  | 'mfa.recovery_codes.regenerate'
  | 'mfa.totp.add'
  | 'mfa.totp.remove'
  | 'password.change'
  | 'sessions.revoke'
  | 'sessions.revoke_others';

export interface ReauthenticationBinding {
  readonly action: CriticalAction;
  readonly resource_type: string | null;
  readonly resource_id: string | null;
  readonly branch_id: string | null;
  readonly parameters: Readonly<Record<string, string>>;
  readonly reason: string | null;
}

export interface PasswordTotpReauthentication extends ReauthenticationBinding {
  readonly method: 'PASSWORD_TOTP';
  readonly password: string;
  readonly totp_code: string;
}

export interface PasskeyReauthentication extends ReauthenticationBinding {
  readonly method: 'PASSKEY';
  readonly challenge_id?: string;
  readonly assertion?: WebAuthnAssertionPayload;
}

export interface TemporaryAuthorization {
  readonly authorization_token: string;
  readonly expires_at: string;
}

export interface PasskeyChallenge {
  readonly challenge_id: string;
  readonly challenge: string;
  readonly expires_at: string;
  readonly allow_credentials: readonly { readonly id: string; readonly type: 'public-key' }[];
}

export interface AuthSessionDto {
  readonly id: string;
  readonly application: string;
  readonly device_id: string | null;
  readonly device_name: string | null;
  readonly created_at: string;
  readonly last_activity_at: string;
  readonly ip_address: string | null;
  readonly is_current: boolean;
}

export interface SecurityAlertDto {
  readonly id: string;
  readonly type?: string;
  readonly severity?: string;
  readonly status?: string;
  readonly title?: string;
  readonly message?: string;
  readonly action_path?: string | null;
  readonly can_request_action?: boolean;
  readonly acknowledged_at?: string | null;
  readonly created_at?: string;
}

export interface TotpSetup {
  readonly secret: string;
  readonly uri: string;
}
