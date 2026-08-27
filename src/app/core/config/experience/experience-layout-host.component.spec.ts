import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { DeviceContext } from './experience.models';
import { EXPERIENCE_LAYOUT_LOADER } from './experience-layout.loader';
import { ExperienceLayoutHostComponent } from './experience-layout-host.component';
import { ExperiencePolicyService } from './experience-policy.service';

@Component({ standalone: true, template: '<p data-layout="desktop">Escritorio</p>' })
class DesktopTestLayout {}

@Component({ standalone: true, template: '<p data-layout="tablet">Tableta</p>' })
class TabletTestLayout {}

describe('ExperienceLayoutHostComponent', () => {
  it('reemplaza inmediatamente el layout cuando cambia la experiencia del rol', async () => {
    const decision = signal({
      kind: 'allowed' as const,
      requiredExperience: 'desktop' as const,
      device: deviceContext('desktop'),
    });
    const loader = vi.fn(async (experience: string) =>
      experience === 'tablet' ? TabletTestLayout : DesktopTestLayout,
    );

    TestBed.configureTestingModule({
      imports: [ExperienceLayoutHostComponent],
      providers: [
        { provide: ExperiencePolicyService, useValue: { decision } },
        { provide: EXPERIENCE_LAYOUT_LOADER, useValue: loader },
      ],
    });

    const fixture = TestBed.createComponent(ExperienceLayoutHostComponent);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('[data-layout="desktop"]')).toBeTruthy(),
    );

    decision.set({
      kind: 'allowed',
      requiredExperience: 'tablet',
      device: deviceContext('tablet'),
    });
    fixture.detectChanges();

    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('[data-layout="tablet"]')).toBeTruthy(),
    );
    expect(fixture.nativeElement.querySelector('[data-layout="desktop"]')).toBeNull();
    expect(loader).toHaveBeenLastCalledWith('tablet');
  });
});

function deviceContext(detectedClass: 'desktop' | 'tablet'): DeviceContext {
  return {
    viewportWidth: detectedClass === 'desktop' ? 1440 : 1024,
    viewportHeight: detectedClass === 'desktop' ? 900 : 768,
    screenWidth: detectedClass === 'desktop' ? 1440 : 1024,
    screenHeight: detectedClass === 'desktop' ? 900 : 768,
    orientation: 'landscape',
    pointer: detectedClass === 'desktop' ? 'fine' : 'coarse',
    anyPointer: detectedClass === 'desktop' ? 'fine' : 'coarse',
    hover: detectedClass === 'desktop',
    anyHover: detectedClass === 'desktop',
    touch: detectedClass === 'tablet',
    maxTouchPoints: detectedClass === 'tablet' ? 5 : 0,
    userAgentData: { mobile: false, platform: detectedClass === 'desktop' ? 'Windows' : 'Android' },
    userAgent: detectedClass,
    detectedClass,
    confidence: 'high',
    viewportViability: { desktop: detectedClass === 'desktop', tablet: detectedClass === 'tablet', mobile: false },
  };
}
