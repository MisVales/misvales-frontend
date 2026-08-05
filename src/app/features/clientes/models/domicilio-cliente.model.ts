export interface DomicilioCliente {
  id: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string | null;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  ciudad: string;
  estado: string;
  pais: string;
  vigenteDesde: string;
}
