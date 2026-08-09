export type EstadoInformativoCartera = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;

export interface ResumenCartera {
  saldoActual: string;
  estadoInformativo: EstadoInformativoCartera;
  ultimoPagoEn: string | null;
  cantidadMovimientos: number;
  tieneRegistrosVencidos: boolean;
  saldoCeroParaTransferencia: boolean;
}
