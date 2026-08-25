const CLAVES_RETIRADAS = new Set([
  'VOUCHER_FORTNIGHTS_COUNT',
  'MODIFICATION_TOKEN_TTL',
  'EARLY_PAYMENT_PERIOD',
]);

const CONFIGURACIONES_DE_PAGO = new Set(['RELATION_PAYMENT_BANK']);

const CONDICIONES_FINANCIERAS_VALE = new Set([
  'LOAN_COMMISSION_PERCENTAGE',
  'INTEREST_RATE_PER_FORTNIGHT',
  'VOUCHER_INSURANCE_AMOUNT',
  'LATE_FEE_AMOUNT',
]);

export function esConfiguracionVisible(clave: string): boolean {
  return !CLAVES_RETIRADAS.has(clave);
}

export function esConfiguracionEditable(clave: string): boolean {
  return esConfiguracionVisible(clave);
}

export function esCondicionFinancieraVale(clave: string): boolean {
  return CONDICIONES_FINANCIERAS_VALE.has(clave);
}

export function esConfiguracionDePago(clave: string): boolean {
  return CONFIGURACIONES_DE_PAGO.has(clave);
}
