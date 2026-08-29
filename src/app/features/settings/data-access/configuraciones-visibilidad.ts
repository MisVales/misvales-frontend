const CLAVES_RETIRADAS = new Set([
  'VOUCHER_FORTNIGHTS_COUNT',
  'MODIFICATION_TOKEN_TTL',
  'EARLY_PAYMENT_PERIOD',
  'LOAN_COMMISSION_PERCENTAGE',
  'INTEREST_RATE_PER_FORTNIGHT',
  'VOUCHER_INSURANCE_AMOUNT',
  'VOUCHER_MIN_FORTNIGHTS_COUNT',
  'VOUCHER_MAX_FORTNIGHTS_COUNT',
  'LATE_FEE_AMOUNT',
]);

const CONFIGURACIONES_DE_PAGO = new Set(['RELATION_PAYMENT_BANK']);

const CONDICIONES_FINANCIERAS_VALE = new Set([
  'LOAN_COMMISSION_PERCENTAGE',
  'INTEREST_RATE_PER_FORTNIGHT',
  'VOUCHER_INSURANCE_AMOUNT',
  'VOUCHER_MIN_FORTNIGHTS_COUNT',
  'VOUCHER_MAX_FORTNIGHTS_COUNT',
  'LATE_FEE_AMOUNT',
]);

const HORARIOS_VERIFICACION_DOMICILIO = new Set([
  'VERIFICATION_START_TIME',
  'VERIFICATION_MAX_START_TIME',
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

export function esHorarioVerificacionDomicilio(clave: string): boolean {
  return HORARIOS_VERIFICACION_DOMICILIO.has(clave);
}

export function esHorarioDeVerificacion(clave: string): boolean {
  return HORARIOS_VERIFICACION_DOMICILIO.has(clave);
}
