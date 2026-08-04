export interface TotpSetupRes {
  qrCodeUrl: string;
  secret: string; // Enmascarado en la UI
}

export interface TotpVerifyReq {
  code: string;
}

export interface RecoveryCodesRes {
  codes: string[];
}

export interface SessionDeviceRes {
  id: string;
  device: string; // Ej: "Chrome on Windows"
  ip: string;
  lastActive: string; // ISO Date
  isCurrent: boolean;
}
