import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeviceSignals } from './experience.models';
import type { DeviceSignalSource } from './device-signal-source';
import { DEVICE_SIGNAL_SOURCE } from './device-signal-source';
import { DeviceExperienceService } from './device-experience.service';
import { DEVICE_EVENT_DEBOUNCE_MS } from './experience.tokens';

class FakeDeviceSignalSource implements DeviceSignalSource {
  value = desktopSignals();
  listener: (() => void) | null = null;
  unsubscribed = false;

  read(): DeviceSignals {
    return this.value;
  }

  subscribe(listener: () => void): () => void {
    this.listener = listener;
    return () => {
      this.unsubscribed = true;
      this.listener = null;
    };
  }

  emit(value: DeviceSignals): void {
    this.value = value;
    this.listener?.();
  }
}

function desktopSignals(): DeviceSignals {
  return {
    viewportWidth: 1440,
    viewportHeight: 900,
    screenWidth: 1440,
    screenHeight: 900,
    orientation: 'landscape',
    pointer: 'fine',
    anyPointer: 'fine',
    hover: true,
    anyHover: true,
    touch: false,
    maxTouchPoints: 0,
    userAgentData: { mobile: false, platform: 'Windows' },
    userAgent: 'Windows NT 10.0',
  };
}

describe('DeviceExperienceService', () => {
  let source: FakeDeviceSignalSource;

  beforeEach(() => {
    vi.useFakeTimers();
    source = new FakeDeviceSignalSource();
    TestBed.configureTestingModule({
      providers: [
        DeviceExperienceService,
        { provide: DEVICE_SIGNAL_SOURCE, useValue: source },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('debounces browser changes for 150ms and publishes a distinct context', () => {
    const service = TestBed.inject(DeviceExperienceService);
    const initial = service.context();
    const resized = { ...desktopSignals(), viewportWidth: 390, viewportHeight: 844 };

    source.emit(resized);
    vi.advanceTimersByTime(DEVICE_EVENT_DEBOUNCE_MS - 1);
    expect(service.context()).toBe(initial);

    vi.advanceTimersByTime(1);
    expect(service.context()).not.toBe(initial);
    expect(service.context().detectedClass).toBe('desktop');
    expect(service.context().viewportViability.desktop).toBe(false);

    const resizedContext = service.context();
    source.emit(resized);
    vi.advanceTimersByTime(DEVICE_EVENT_DEBOUNCE_MS);
    expect(service.context()).toBe(resizedContext);
  });

  it('supports an immediate retry and cleans up listeners', () => {
    const service = TestBed.inject(DeviceExperienceService);
    source.value = { ...desktopSignals(), viewportWidth: 390, viewportHeight: 844 };

    service.refresh();
    expect(service.context().viewportViability.desktop).toBe(false);

    TestBed.resetTestingModule();
    expect(source.unsubscribed).toBe(true);
  });
});
