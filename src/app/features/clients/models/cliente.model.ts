import { DomicilioCliente } from './domicilio-cliente.model';
import { CuentaBancariaCliente } from './cuenta-bancaria-cliente.model';
import { AsignacionCliente } from './asignacion-cliente.model';
import { ResumenCartera } from './resumen-cartera.model';

export type EstadoCliente = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'NO_RECORDS';

export interface Cliente {
  id: string;
  numero: string;
  nombreCompleto: string;
  curpEnmascarada: string;
  rfcEnmascarado: string | null;
  fechaNacimiento: string;
  lugarNacimiento: string;
  domicilioVigente: DomicilioCliente;
  cuentaBancariaVigente: CuentaBancariaCliente | null;
  asignacionVigente: AsignacionCliente;
  resumenCartera: ResumenCartera;
  creadoEn: string;
  versionBloqueo: number;
  estado: EstadoCliente;
}
