import { DomicilioCliente } from './domicilio-cliente.model';
import { CuentaBancariaCliente } from './cuenta-bancaria-cliente.model';
import { AsignacionCliente } from './asignacion-cliente.model';
import { ResumenCartera } from './resumen-cartera.model';

export type EstadoCliente = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

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
  estado: EstadoCliente; // keeping this general status for Listado if needed
}
