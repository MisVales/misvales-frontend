export interface CuentaBancariaCliente {
  id: string;
  banco: string;
  titular: string;
  cuentaEnmascarada: string | null;
  clabeEnmascarada: string;
  vigenteDesde: string;
}
