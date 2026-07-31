export type AccountRequestRole = 'CASHIER' | 'COORDINATOR' | 'VERIFIER';
export type DirectAccountRole = 'ADMINISTRATOR' | 'CASHIER' | 'COORDINATOR' | 'VERIFIER';

export interface AccountRequestDto {
  readonly public_id: string;
  readonly type: string;
  readonly state: 'APPROVED' | 'CANCELLED' | 'PENDING_APPROVAL' | 'REJECTED';
  readonly target_email: string | null;
  readonly target_name: string | null;
  readonly reason: string;
  readonly created_at: string;
  readonly decided_at: string | null;
}

export interface CreateAccountRequestPayload {
  readonly name: string;
  readonly email: string;
  readonly role: AccountRequestRole;
  readonly reason: string;
  readonly reauth_token: string;
}

export interface CreateAccountPayload {
  readonly name: string;
  readonly email: string;
  readonly role: DirectAccountRole;
  readonly branch_id: string | null;
  readonly authorization_token: string;
}
