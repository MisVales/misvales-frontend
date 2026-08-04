export interface LoginReq {
  email: string;
  password?: string;
  totpCode?: string; // Optional if MFA is active
}

export interface LoginRes {
  requiresMfa: boolean;
  token?: string; // Optional if backend sets HTTP Only cookie
  user?: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export interface MfaReq {
  totpCode: string;
}

export interface RecoverReq {
  email: string;
}

export interface ResetPwdReq {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface InvitationRes {
  isValid: boolean;
  email: string;
  organizationName?: string;
}
