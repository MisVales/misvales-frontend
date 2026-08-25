export type TipoMovimientoCartera = 'DEBT' | 'PAYMENT' | 'PARTIAL_PAYMENT' | 'STATUS_UPDATE' | 'NOTE' | 'ADJUSTMENT_INCREASE' | 'ADJUSTMENT_DECREASE';

export interface MovimientoCartera {
  id: string;
  fecha: string;
  tipo: TipoMovimientoCartera;
  importe: string | null; // Some may not have amount, like NOTE
  concepto: string;
  saldoNuevo: string | null;
  registradoPor: string;
  estadoInformativo: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;
  versionBloqueo: number;
}
