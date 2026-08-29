export interface UploadFileRule {
  readonly label: string;
  readonly extensions: readonly string[];
  readonly maxBytes: number;
}

const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'jfif',
  'png',
  'webp',
  'gif',
  'bmp',
  'tif',
  'tiff',
  'heic',
  'heif',
  'avif',
] as const;

const IMAGE_LABEL = 'JPG, JPEG, JFIF, PNG, WebP, GIF, BMP, TIF, TIFF, HEIC, HEIF o AVIF';

export const PRIVATE_MEDIA_FILE_RULE: UploadFileRule = {
  label: `${IMAGE_LABEL} o PDF`,
  extensions: [...IMAGE_EXTENSIONS, 'pdf'],
  maxBytes: 15 * 1024 * 1024,
};

export const VERIFICATION_EVIDENCE_FILE_RULE: UploadFileRule = {
  label: `${IMAGE_LABEL} o PDF`,
  extensions: [...IMAGE_EXTENSIONS, 'pdf'],
  maxBytes: 10 * 1024 * 1024,
};

export const BANK_XLSX_FILE_RULE: UploadFileRule = {
  label: 'XLSX',
  extensions: ['xlsx'],
  maxBytes: 10 * 1024 * 1024,
};

export function acceptedExtensions(rule: UploadFileRule): string {
  return rule.extensions.map((extension) => `.${extension}`).join(',');
}

export function validateUploadFile(file: File | null | undefined, rule: UploadFileRule): string | null {
  if (!file) {
    return 'Selecciona un archivo.';
  }

  if (file.size <= 0) {
    return 'El archivo está vacío.';
  }

  const extension = file.name.split('.').pop()?.trim().toLowerCase() ?? '';
  if (!extension || !rule.extensions.includes(extension)) {
    return `Archivo inválido. Solo se aceptan: ${rule.label}.`;
  }

  const mime = file.type.trim().toLowerCase();
  if (mime && !mimeMatchesExtension(extension, mime)) {
    return `Archivo inv\u00E1lido. La extensi\u00F3n .${extension} no coincide con el tipo real del archivo.`;
  }

  if (file.size > rule.maxBytes) {
    return `Archivo demasiado grande. El tamaño máximo es ${formatBytes(rule.maxBytes)}.`;
  }

  return null;
}

function mimeMatchesExtension(extension: string, mime: string): boolean {
  if (extension === 'pdf') return mime === 'application/pdf';
  if (extension === 'xlsx') {
    return [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ].includes(mime);
  }

  const imageMimes: Record<string, readonly string[]> = {
    jpg: ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif'],
    jpeg: ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif'],
    jfif: ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif'],
    png: ['image/png', 'image/x-png'],
    webp: ['image/webp'],
    gif: ['image/gif'],
    bmp: ['image/bmp', 'image/x-bmp', 'image/x-ms-bmp'],
    tif: ['image/tiff', 'image/tif', 'image/x-tiff'],
    tiff: ['image/tiff', 'image/tif', 'image/x-tiff'],
    heic: ['image/heic', 'image/heic-sequence'],
    heif: ['image/heif', 'image/heif-sequence'],
    avif: ['image/avif'],
  };

  return imageMimes[extension]?.includes(mime) ?? false;
}

function formatBytes(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)} MB`;
}
