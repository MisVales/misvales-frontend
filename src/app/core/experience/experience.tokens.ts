import type { ExperienceType } from './experience.models';

export const DEVICE_EVENT_DEBOUNCE_MS = 150;

interface ViewportLimits {
  minShortEdge: number;
  maxShortEdge: number;
  minLongEdge: number;
  maxLongEdge: number;
}

/**
 * Technical viewport limits are centralized here so they cannot become
 * scattered authorization rules. Physical device classification is separate.
 */
export const EXPERIENCE_VIEWPORT_LIMITS: Readonly<Record<ExperienceType, ViewportLimits>> = {
  desktop: {
    minShortEdge: 600,
    maxShortEdge: Number.POSITIVE_INFINITY,
    minLongEdge: 1024,
    maxLongEdge: Number.POSITIVE_INFINITY,
  },
  tablet: {
    minShortEdge: 600,
    maxShortEdge: 1100,
    minLongEdge: 800,
    maxLongEdge: 1440,
  },
  mobile: {
    minShortEdge: 320,
    maxShortEdge: 599,
    minLongEdge: 480,
    maxLongEdge: 1024,
  },
};

