import { describe, expect, it } from 'vitest';
import type { DeviceSignals } from './experience.models';
import { classifyDevice } from './device-classifier';

function signals(overrides: Partial<DeviceSignals> = {}): DeviceSignals {
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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ...overrides,
  };
}

describe('classifyDevice', () => {
  it('classifies a regular desktop with high confidence', () => {
    const context = classifyDevice(signals());

    expect(context.detectedClass).toBe('desktop');
    expect(context.confidence).toBe('high');
    expect(context.viewportViability.desktop).toBe(true);
  });

  it('keeps a touchscreen laptop in the desktop family', () => {
    const context = classifyDevice(
      signals({
        viewportWidth: 1366,
        viewportHeight: 768,
        screenWidth: 1366,
        screenHeight: 768,
        touch: true,
        maxTouchPoints: 10,
      }),
    );

    expect(context.detectedClass).toBe('desktop');
  });

  it.each([
    ['portrait', 820, 1180],
    ['landscape', 1180, 820],
  ] as const)('classifies a touch tablet in %s', (orientation, width, height) => {
    const context = classifyDevice(
      signals({
        viewportWidth: width,
        viewportHeight: height,
        screenWidth: width,
        screenHeight: height,
        orientation,
        pointer: 'coarse',
        anyPointer: 'coarse',
        hover: false,
        anyHover: false,
        touch: true,
        maxTouchPoints: 10,
        userAgentData: { mobile: false, platform: 'Android' },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Tablet)',
      }),
    );

    expect(context.detectedClass).toBe('tablet');
    expect(context.viewportViability.tablet).toBe(true);
  });

  it('keeps a tablet with keyboard and trackpad in the tablet family', () => {
    const context = classifyDevice(
      signals({
        viewportWidth: 1024,
        viewportHeight: 1366,
        screenWidth: 1024,
        screenHeight: 1366,
        orientation: 'portrait',
        touch: true,
        maxTouchPoints: 10,
        userAgentData: { mobile: false, platform: 'Windows' },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Tablet PC)',
      }),
    );

    expect(context.detectedClass).toBe('tablet');
  });

  it.each([
    ['portrait', 390, 844],
    ['landscape', 844, 390],
  ] as const)('classifies a phone in %s', (orientation, width, height) => {
    const context = classifyDevice(
      signals({
        viewportWidth: width,
        viewportHeight: height,
        screenWidth: width,
        screenHeight: height,
        orientation,
        pointer: 'coarse',
        anyPointer: 'coarse',
        hover: false,
        anyHover: false,
        touch: true,
        maxTouchPoints: 5,
        userAgentData: { mobile: true, platform: 'Android' },
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile)',
      }),
    );

    expect(context.detectedClass).toBe('mobile');
    expect(context.viewportViability.mobile).toBe(true);
  });

  it('does not let a mobile viewport convert a physical desktop', () => {
    const context = classifyDevice(
      signals({ viewportWidth: 390, viewportHeight: 844, orientation: 'portrait' }),
    );

    expect(context.detectedClass).toBe('desktop');
    expect(context.viewportViability.desktop).toBe(false);
  });

  it('does not decide from viewport or user-agent alone', () => {
    const noPhysicalSignals = signals({
      viewportWidth: 390,
      viewportHeight: 844,
      screenWidth: 0,
      screenHeight: 0,
      pointer: 'none',
      anyPointer: 'none',
      hover: false,
      anyHover: false,
      userAgentData: { mobile: true, platform: null },
      userAgent: 'Mobile',
    });

    expect(classifyDevice(noPhysicalSignals).detectedClass).toBe('unknown');
    expect(classifyDevice({ ...noPhysicalSignals, userAgent: '' }).detectedClass).toBe('unknown');
  });

  it('fails closed when only geometry is available', () => {
    const context = classifyDevice(
      signals({
        viewportWidth: 800,
        viewportHeight: 1100,
        screenWidth: 800,
        screenHeight: 1100,
        pointer: 'none',
        anyPointer: 'none',
        hover: false,
        anyHover: false,
        userAgentData: { mobile: null, platform: null },
        userAgent: '',
      }),
    );

    expect(context.detectedClass).toBe('unknown');
    expect(context.confidence).toBe('low');
  });
});
