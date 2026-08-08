export type EstadoInformativoCartera = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';

export interface ResumenCartera {
  saldoActual: string;
  estadoInformativo: EstadoInformativoCartera;
  ultimoPagoEn: string | null;
  cantidadMovimientos: number;
  tieneRegistrosVencidos: boolean;
  saldoCeroParaTransferencia: boolean;
}
