import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { SessionStore } from '@core/session/session.store';
import { DeviceExperienceService } from './device-experience.service';
import type { DeviceContext } from './experience.models';
import { EXPERIENCE_LAYOUT_LOADER } from './experience-layout.loader';
import { ExperienceLayoutHostComponent } from './experience-layout-host.component';

@Component({ standalone: true, template: '<p data-layout="desktop">Escritorio</p>' })
class DesktopTestLayout {}

@Component({ standalone: true, template: '<p data-layout="tablet">Tableta</p>' })
class TabletTestLayout {}

describe('ExperienceLayoutHostComponent', () => {
  it('reemplaza inmediatamente el layout cuando cambia la experiencia del rol', async () => {
    const context = signal({} as DeviceContext);
    const loader = vi.fn(async (experience: string) =>
      experience === 'tablet' ? TabletTestLayout : DesktopTestLayout,
    );

    TestBed.configureTestingModule({
      imports: [ExperienceLayoutHostComponent],
      providers: [
        { provide: DeviceExperienceService, useValue: { context } },
        { provide: EXPERIENCE_LAYOUT_LOADER, useValue: loader },
      ],
    });

    const session = TestBed.inject(SessionStore);
    session.setSession(
      { id: 'user-1', name: 'Persona', email: 'persona@example.test' },
      ['branch_manager'],
      [],
      null,
    );
    const fixture = TestBed.createComponent(ExperienceLayoutHostComponent);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('[data-layout="desktop"]')).toBeTruthy(),
    );

    session.setSession(
      { id: 'user-2', name: 'Coordinación', email: 'coordinacion@example.test' },
      ['coordinator'],
      [],
      null,
    );
    fixture.detectChanges();

    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('[data-layout="tablet"]')).toBeTruthy(),
    );
    expect(fixture.nativeElement.querySelector('[data-layout="desktop"]')).toBeNull();
    expect(loader).toHaveBeenLastCalledWith('tablet');
  });
});
