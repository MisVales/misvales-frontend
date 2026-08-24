import {
  AccordionSection,
  DecisionOption,
  DetailItem,
  DifferenceItem,
  EvidenceItem,
  RequestItem,
  TableColumn,
  VerificationStep,
} from '@features/verifications/presentation/models/verification.models';

const INTERIOR_IMAGE_URL = new URL('../../../interior.webp', import.meta.url).toString();

export const REQUESTS: readonly RequestItem[] = [
  {
    folio: 'MV-2025-02184',
    applicant: 'María González López',
    phone: '55 3456 7890',
    address: 'Av. Insurgentes Sur 1234, Del Valle, Benito Juárez, CDMX',
    latitude: 19.3733,
    longitude: -99.1786,
    estimatedTime: '45 min',
    status: 'pending',
  },
  {
    folio: 'MV-2025-02183',
    applicant: 'José Luis Hernández',
    phone: '55 2345 6789',
    address: 'Calle 16 de Septiembre 45, Centro, Toluca',
    latitude: 19.2892,
    longitude: -99.6557,
    estimatedTime: '40 min',
    status: 'visiting',
  },
  {
    folio: 'MV-2025-02182',
    applicant: 'Comercializadora Delta',
    phone: '33 1987 6543',
    address: 'Av. Vallarta 6503, Zapopan, Jalisco',
    latitude: 20.6807,
    longitude: -103.4292,
    estimatedTime: '50 min',
    status: 'evidence',
  },
  {
    folio: 'MV-2025-02181',
    applicant: 'Ana Belén Martínez',
    phone: '81 2233 4455',
    address: 'Priv. Las Palmas 102, San Nicolás',
    latitude: 25.7417,
    longitude: -100.3022,
    estimatedTime: '35 min',
    status: 'differences',
  },
];
export const PERSONAL_DETAILS: readonly DetailItem[] = [
  { label: 'Nacionalidad', value: 'Mexicana' },
  { label: 'Nombres', value: 'María González' },
  { label: 'Apellidos', value: 'López' },
  { label: 'CURP', value: 'GOLM881215MDFRPR05' },
  { label: 'RFC', value: 'GOLM8812153B2' },
  { label: 'Teléfono', value: '55 3456 7890' },
];
export const DECLARED_DATA: readonly DetailItem[] = [
  { icon: 'store', label: 'Tipo de negocio / Giro', value: 'Abarrotes / Minisúper' },
  { icon: 'clock', label: 'Horario de operación', value: '07:00 – 22:00' },
  { icon: 'receipt-text', label: 'RFC', value: 'MSD201215AB4' },
  { icon: 'smartphone', label: 'Medios de contacto', value: 'WhatsApp, teléfono fijo' },
];
export const TABLE_COLUMNS: readonly TableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'relationship', label: 'Parentesco' },
  { key: 'birth', label: 'F. nac.' },
  { key: 'school', label: 'Escuela' },
];
export const TABLE_ROWS = [
  {
    name: 'Camila Hernández González',
    relationship: 'Hija',
    birth: '05/06/2012',
    school: 'Prim. Del Valle',
  },
  {
    name: 'Santiago Hernández González',
    relationship: 'Hijo',
    birth: '11/09/2016',
    school: 'Prim. Del Valle',
  },
];
export const STEPS: readonly VerificationStep[] = [
  { label: 'Expediente', description: 'Revisión inicial', state: 'completed' },
  { label: 'En visita', description: 'Levantamiento', state: 'completed' },
  { label: 'Evidencias y diferencias', description: 'Análisis de comprobación', state: 'active' },
  { label: 'Resultado', description: 'Determinación final', state: 'pending' },
];
export const ACCORDION: readonly AccordionSection[] = [
  {
    id: 'personal',
    label: 'Datos personales',
    icon: '♙',
    status: 'completed',
    fields: [
      { name: 'Nombre completo', declaredValue: 'María González López', selected: 'verified' },
      { name: 'Teléfono', declaredValue: '55 3456 7890', selected: 'verified' },
      { name: 'Identidad', declaredValue: 'Documentación consultable', selected: 'verified' },
    ],
  },
  {
    id: 'home',
    label: 'Domicilios',
    icon: '⌂',
    differences: 1,
    fields: [
      { name: 'Tipo de vivienda', declaredValue: 'Propia', selected: 'verified' },
      {
        name: 'Dirección',
        declaredValue: 'Av. Insurgentes Sur 1234, Del Valle',
        selected: 'difference',
      },
      { name: 'Tiempo de residencia', declaredValue: '5 años', selected: 'verified' },
    ],
  },
  {
    id: 'assets',
    label: 'Patrimonio',
    icon: '▥',
    differences: 1,
    fields: [{ name: 'Bien declarado', declaredValue: 'Vivienda propia', selected: 'difference' }],
  },
  {
    id: 'jobs',
    label: 'Empleos',
    icon: '▣',
    status: 'review',
    fields: [
      { name: 'Actividad', declaredValue: 'Comercio minorista', selected: 'verified' },
      { name: 'Antigüedad', declaredValue: '4 años', selected: 'verified' },
    ],
  },
  {
    id: 'credits',
    label: 'Créditos comerciales',
    icon: '▤',
    status: 'no-differences',
    fields: [{ name: 'Relación comercial', declaredValue: 'Cuenta vigente', selected: 'verified' }],
  },
];
export const EVIDENCES: readonly EvidenceItem[] = [
  {
    title: 'Fotografía de fachada',
    fileName: 'IMG_20250521_1012.jpg',
    size: '1.2 MB',
    kind: 'image',
    imageUrl: INTERIOR_IMAGE_URL,
    status: 'consultable',
  },
  {
    title: 'Fotografía del interior',
    fileName: 'IMG_20250521_1018.jpg',
    size: '1.4 MB',
    kind: 'image',
    imageUrl: INTERIOR_IMAGE_URL,
    status: 'consultable',
  },
  {
    title: 'Documento (recibo de luz)',
    fileName: 'Recibo_Luz_Mayo2025.pdf',
    size: '582 KB',
    kind: 'pdf',
    status: 'consultable',
  },
];
export const DIFFERENCES: readonly DifferenceItem[] = [
  { text: 'Domicilio no coincide en número exterior', severity: 'error' },
  { text: 'Comprobante de domicilio con fecha vencida', severity: 'error' },
  { text: 'Nombre en INE no coincide con el del solicitante', severity: 'error' },
];
export const DECISIONS: readonly DecisionOption[] = [
  {
    value: 'favorable',
    label: 'Favorable',
    description: 'La información y evidencias son consistentes con lo declarado.',
    icon: '♧',
    tone: 'favorable',
  },
  {
    value: 'unfavorable',
    label: 'Desfavorable',
    description: 'La información presenta inconsistencias o no cumple con lo declarado.',
    icon: '♤',
    tone: 'unfavorable',
  },
];
