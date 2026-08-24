import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';
import type {
  DeviceOrientation,
  DeviceSignals,
  PointerCapability,
} from './experience.models';

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
  };
}

export interface DeviceSignalSource {
  read(): DeviceSignals;
  subscribe(listener: () => void): () => void;
}

interface LegacyMediaQueryList extends MediaQueryList {
  addListener(listener: (event: MediaQueryListEvent) => void): void;
  removeListener(listener: (event: MediaQueryListEvent) => void): void;
}

const WATCHED_MEDIA_QUERIES = [
  '(pointer: fine)',
  '(pointer: coarse)',
  '(any-pointer: fine)',
  '(any-pointer: coarse)',
  '(hover: hover)',
  '(any-hover: hover)',
  '(orientation: portrait)',
] as const;

@Injectable({ providedIn: 'root' })
export class BrowserDeviceSignalSource implements DeviceSignalSource {
  private readonly document = inject(DOCUMENT);
  private readonly browserWindow = this.document.defaultView;

  read(): DeviceSignals {
    const browserWindow = this.browserWindow;
    if (!browserWindow) return unknownSignals();

    const navigator = browserWindow.navigator as NavigatorWithUserAgentData;
    const maxTouchPoints = Math.max(0, navigator.maxTouchPoints ?? 0);
    const viewportWidth = Math.max(0, browserWindow.innerWidth);
    const viewportHeight = Math.max(0, browserWindow.innerHeight);

    return {
      viewportWidth,
      viewportHeight,
      screenWidth: Math.max(0, browserWindow.screen?.width ?? 0),
      screenHeight: Math.max(0, browserWindow.screen?.height ?? 0),
      orientation: this.readQuery('(orientation: portrait)')
        ? 'portrait'
        : viewportWidth <= viewportHeight
          ? 'portrait'
          : 'landscape',
      pointer: this.readPointer('pointer'),
      anyPointer: this.readPointer('any-pointer'),
      hover: this.readQuery('(hover: hover)'),
      anyHover: this.readQuery('(any-hover: hover)'),
      touch: maxTouchPoints > 0 || 'ontouchstart' in browserWindow,
      maxTouchPoints,
      userAgentData: {
        mobile:
          typeof navigator.userAgentData?.mobile === 'boolean'
            ? navigator.userAgentData.mobile
            : null,
        platform: navigator.userAgentData?.platform ?? null,
      },
      userAgent: navigator.userAgent ?? '',
    };
  }

  subscribe(listener: () => void): () => void {
    const browserWindow = this.browserWindow;
    if (!browserWindow) return () => undefined;

    const onChange = (): void => listener();
    const mediaQueries = WATCHED_MEDIA_QUERIES.map((query) => browserWindow.matchMedia(query));

    browserWindow.addEventListener('resize', onChange);
    browserWindow.addEventListener('orientationchange', onChange);
    const orientation = browserWindow.screen.orientation;
    if (orientation && 'addEventListener' in orientation) {
      orientation.addEventListener('change', onChange);
    }
    mediaQueries.forEach((query) => {
      const legacyQuery = query as LegacyMediaQueryList;
      if ('addEventListener' in query) query.addEventListener('change', onChange);
      else legacyQuery.addListener(onChange);
    });

    return () => {
      browserWindow.removeEventListener('resize', onChange);
      browserWindow.removeEventListener('orientationchange', onChange);
      if (orientation && 'removeEventListener' in orientation) {
        orientation.removeEventListener('change', onChange);
      }
      mediaQueries.forEach((query) => {
        const legacyQuery = query as LegacyMediaQueryList;
        if ('removeEventListener' in query) query.removeEventListener('change', onChange);
        else legacyQuery.removeListener(onChange);
      });
    };
  }

  private readPointer(prefix: 'pointer' | 'any-pointer'): PointerCapability {
    if (this.readQuery(`(${prefix}: coarse)`)) return 'coarse';
    if (this.readQuery(`(${prefix}: fine)`)) return 'fine';
    return 'none';
  }

  private readQuery(query: string): boolean {
    try {
      return this.browserWindow?.matchMedia(query).matches ?? false;
    } catch {
      return false;
    }
  }
}

export const DEVICE_SIGNAL_SOURCE = new InjectionToken<DeviceSignalSource>(
  'DEVICE_SIGNAL_SOURCE',
  { factory: () => inject(BrowserDeviceSignalSource) },
);

function unknownSignals(): DeviceSignals {
  const orientation: DeviceOrientation = 'portrait';
  return {
    viewportWidth: 0,
    viewportHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    orientation,
    pointer: 'none',
    anyPointer: 'none',
    hover: false,
    anyHover: false,
    touch: false,
    maxTouchPoints: 0,
    userAgentData: { mobile: null, platform: null },
    userAgent: '',
  };
}
