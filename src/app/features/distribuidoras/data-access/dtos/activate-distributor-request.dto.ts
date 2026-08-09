export interface ActivateDistributorRequestDto {
  category_version_id: string;
  // Note: the backend handles the actual parameters like branch or coordinator overriding if any,
  // but the pdf says "No permitir cambiar sucursal o coordinador fuera del flujo autorizado"
  // and "Enviar clave de idempotencia" which is usually a header.
}
