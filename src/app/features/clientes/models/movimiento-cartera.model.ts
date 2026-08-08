export type TipoMovimientoCartera = 'CHARGE' | 'PAYMENT' | 'NOTE' | 'ADJUSTMENT' | 'STATUS_UPDATE';

export interface MovimientoCartera {
  id: string;
  fecha: string;
  tipo: TipoMovimientoCartera;
  importe: string | null; // Some may not have amount, like NOTE
  concepto: string;
  saldoNuevo: string | null;
  registradoPor: string;
}
