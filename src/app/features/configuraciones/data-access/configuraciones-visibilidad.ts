/**
 * Configuraciones usadas internamente por servicios de negocio. No forman
 * parte de la administración operativa y por eso no se exponen en esta UI.
 */
const CLAVES_OCULTAS = new Set(['PAYMENT_DAYS_AFTER_CUT']);

export function esConfiguracionVisible(clave: string): boolean {
  return !CLAVES_OCULTAS.has(clave);
}
