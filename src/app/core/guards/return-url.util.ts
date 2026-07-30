import { ApplicationExperience } from '@core/session/session.store';

const EXPERIENCE_PREFIX: Readonly<Record<ApplicationExperience, string>> = {
  administrativa: '/administrativa',
  tableta: '/tableta',
  distribuidora: '/distribuidora',
};

export function safeReturnUrl(
  candidate: string,
  experience: ApplicationExperience | null = null,
): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return null;
  }

  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    decoded.includes('://')
  ) {
    return null;
  }

  if (!experience) {
    return candidate;
  }

  const prefix = EXPERIENCE_PREFIX[experience];
  return candidate === prefix || candidate.startsWith(`${prefix}/`) ? candidate : null;
}

export function experienceRoot(experience: ApplicationExperience): string {
  return EXPERIENCE_PREFIX[experience];
}
