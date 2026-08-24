import type {
  DeviceClass,
  DeviceContext,
  DeviceSignals,
  ExperienceType,
  ViewportViability,
} from './experience.models';
import { EXPERIENCE_TYPES } from './experience.models';
import { EXPERIENCE_VIEWPORT_LIMITS } from './experience.tokens';

type Scores = Record<ExperienceType, number>;

function geometryHint(signals: DeviceSignals, fineHover: boolean): DeviceClass {
  const shortEdge = Math.min(signals.screenWidth, signals.screenHeight);
  const longEdge = Math.max(signals.screenWidth, signals.screenHeight);

  if (shortEdge <= 0 || longEdge <= 0) return 'unknown';
  if (shortEdge < 600 && longEdge <= 1024) return 'mobile';
  if (longEdge > 1440 || shortEdge > 1100) return 'desktop';

  const aspectRatio = longEdge / shortEdge;
  if (fineHover && longEdge >= 1200 && aspectRatio >= 1.55) return 'desktop';
  if (shortEdge >= 600 && shortEdge <= 1100 && longEdge >= 800 && longEdge <= 1440) {
    return 'tablet';
  }
  if (fineHover && longEdge >= 1024) return 'desktop';

  return 'unknown';
}

function addScore(scores: Scores, experience: ExperienceType, points: number): void {
  scores[experience] += points;
}

export function calculateViewportViability(width: number, height: number): ViewportViability {
  const shortEdge = Math.min(width, height);
  const longEdge = Math.max(width, height);

  return Object.fromEntries(
    EXPERIENCE_TYPES.map((experience) => {
      const limits = EXPERIENCE_VIEWPORT_LIMITS[experience];
      const viable =
        shortEdge >= limits.minShortEdge &&
        shortEdge <= limits.maxShortEdge &&
        longEdge >= limits.minLongEdge &&
        longEdge <= limits.maxLongEdge;
      return [experience, viable];
    }),
  ) as unknown as ViewportViability;
}

export function classifyDevice(signals: DeviceSignals): DeviceContext {
  const scores: Scores = { desktop: 0, tablet: 0, mobile: 0 };
  const fineHover =
    (signals.pointer === 'fine' || signals.anyPointer === 'fine') &&
    (signals.hover || signals.anyHover);
  const coarseTouch =
    signals.touch &&
    (signals.pointer === 'coarse' || signals.anyPointer === 'coarse') &&
    !signals.hover;
  const geometry = geometryHint(signals, fineHover);

  if (geometry !== 'unknown') addScore(scores, geometry, 4);
  if (fineHover) addScore(scores, 'desktop', 3);
  if (coarseTouch) {
    addScore(scores, 'tablet', 2);
    addScore(scores, 'mobile', 2);
  }
  if (geometry === 'tablet' && signals.maxTouchPoints >= 2) addScore(scores, 'tablet', 3);
  if (geometry === 'mobile' && signals.maxTouchPoints >= 1) addScore(scores, 'mobile', 3);

  const platform = signals.userAgentData.platform?.toLowerCase() ?? '';
  const userAgent = signals.userAgent.toLowerCase();
  const ipadLike =
    signals.maxTouchPoints >= 2 &&
    (platform.includes('ipad') || platform.includes('mac') || userAgent.includes('macintosh'));
  const tabletUserAgent =
    /ipad|tablet|kindle|silk/.test(userAgent) ||
    (/android/.test(userAgent) && !/mobile/.test(userAgent));
  const mobileUserAgent = /mobi|iphone|ipod|android.*mobile/.test(userAgent);
  const desktopUserAgent = /windows nt|macintosh|x11|cros/.test(userAgent);

  if (signals.userAgentData.mobile === true) addScore(scores, 'mobile', 2);
  if (ipadLike) addScore(scores, 'tablet', 3);
  if (tabletUserAgent) addScore(scores, 'tablet', 2);
  if (mobileUserAgent) addScore(scores, 'mobile', 1);
  if (!ipadLike && (desktopUserAgent || /windows|macos|linux|chrome os/.test(platform))) {
    addScore(scores, 'desktop', 2);
  }

  // Touch-capable laptops (including Surface devices) frequently report tablet-like
  // geometry. A fine pointer plus hover on a desktop platform is stronger evidence
  // than touch points, unless the browser identifies a real tablet.
  if (!ipadLike && !tabletUserAgent && desktopUserAgent && fineHover) {
    addScore(scores, 'desktop', 3);
  }

  const ranked = EXPERIENCE_TYPES
    .map((experience) => ({ experience, score: scores[experience] }))
    .sort((left, right) => right.score - left.score);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const margin = winner.score - runnerUp.score;
  const classified = winner.score >= 5 && margin >= 2;
  const detectedClass: DeviceClass = classified ? winner.experience : 'unknown';
  const confidence =
    !classified ? 'low' : winner.score >= 8 && margin >= 4 ? 'high' : 'medium';

  return {
    ...signals,
    detectedClass,
    confidence,
    viewportViability: calculateViewportViability(
      signals.viewportWidth,
      signals.viewportHeight,
    ),
  };
}
