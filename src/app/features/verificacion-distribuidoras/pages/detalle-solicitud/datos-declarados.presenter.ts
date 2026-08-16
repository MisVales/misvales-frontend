export interface CampoDeclaradoPresentado {
  etiqueta: string;
  valor: string;
}

const ETIQUETAS_CAMPOS: Record<string, string> = {
  first_name: 'Nombre(s)',
  first_last_name: 'Apellido paterno',
  second_last_name: 'Apellido materno',
  curp_masked: 'CURP',
  rfc_masked: 'RFC',
  birth_date: 'Fecha de nacimiento',
  birth_place: 'Lugar de nacimiento',
  birth_state: 'Estado de nacimiento',
  birth_city: 'Ciudad de nacimiento',
  email: 'Correo electrónico',
  phone_number: 'Teléfono',
  official_id_type: 'Tipo de identificación',
  official_id_number_masked: 'Número de identificación',
  relationship: 'Parentesco',
  declared_age: 'Edad declarada',
  school_name: 'Escuela',
  is_family_reference: 'Referencia familiar',
  is_current: 'Vigente',
  street: 'Calle',
  exterior_number: 'Número exterior',
  interior_number: 'Número interior',
  neighborhood: 'Colonia',
  postal_code: 'Código postal',
  municipality: 'Municipio',
  city: 'Ciudad',
  state: 'Estado',
  country: 'País',
  housing_tenure: 'Tenencia de vivienda',
  financing_status: 'Estado de financiamiento',
  width_meters: 'Frente (m)',
  length_meters: 'Fondo (m)',
  built_area_square_meters: 'Área construida (m²)',
  vehicle_type: 'Tipo de vehículo',
  brand: 'Marca',
  model: 'Modelo',
  model_year: 'Año',
  ownership_status: 'Propiedad',
  entry_type: 'Tipo de registro',
  name: 'Nombre',
  amount: 'Monto',
  outstanding_balance: 'Saldo pendiente',
  monthly_payment: 'Pago mensual',
  is_active: 'Activo',
  employer_name: 'Empleador',
  job_title: 'Puesto',
  started_at: 'Fecha de inicio',
  ended_at: 'Fecha de término',
  company_name: 'Empresa',
  credit_limit: 'Límite de crédito',
  proof_reference: 'Referencia de comprobante',
};

const CAMPOS_TECNICOS = new Set([
  'id',
  'created_at',
  'updated_at',
  'details_payload',
  'reference_payload',
]);

const CAMPOS_MONETARIOS = new Set([
  'amount',
  'outstanding_balance',
  'monthly_payment',
  'credit_limit',
]);

const ETIQUETAS_CATALOGO: Record<string, string> = {
  'entry_type:ASSET': 'Bien',
  'relationship:PARTNER': 'Pareja',
  'official_id_type:INE': 'INE',
  'country:MX': 'México',
  'housing_tenure:OWNED': 'Propia',
  'financing_status:PAID': 'Pagada',
  'ownership_status:OWNED': 'Propio',
};

export function presentarRegistrosDeclarados(valor: unknown): CampoDeclaradoPresentado[][] {
  const registros = Array.isArray(valor) ? valor : [valor];

  return registros
    .map((registro) => presentarRegistro(registro))
    .filter((registro) => registro.length > 0);
}

function presentarRegistro(registro: unknown): CampoDeclaradoPresentado[] {
  if (!esRegistro(registro)) {
    return [{ etiqueta: 'Valor', valor: formatearValor(registro) }];
  }

  return Object.entries(registro)
    .filter(([campo]) => !CAMPOS_TECNICOS.has(campo))
    .map(([campo, valor]) => ({
      etiqueta: ETIQUETAS_CAMPOS[campo] ?? humanizar(campo),
      valor: formatearValor(valor, campo),
    }));
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function formatearValor(valor: unknown, campo?: string): string {
  if (valor === null || valor === undefined || valor === '') return 'Sin dato';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';

  if (campo && typeof valor === 'string') {
    const etiquetaCatalogo = ETIQUETAS_CATALOGO[`${campo}:${valor}`];
    if (etiquetaCatalogo) return etiquetaCatalogo;
  }

  if (campo && CAMPOS_MONETARIOS.has(campo)) {
    const monto = Number(valor);
    if (Number.isFinite(monto)) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      }).format(monto);
    }
  }

  if (typeof valor === 'string' && /^[A-Z][A-Z0-9_]*$/.test(valor)) {
    return humanizar(valor.toLowerCase());
  }

  if (typeof valor === 'object') return 'Información complementaria registrada';

  return String(valor);
}

function humanizar(valor: string): string {
  const texto = valor.replaceAll('_', ' ').trim();
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : 'Dato';
}
