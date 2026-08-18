import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { SessionExpiredService } from './core/session/session-expired.service';

describe('App session expiration host', () => {
  it('makes the application surface inert while the single global dialog is open', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    });
    const sessionExpired = TestBed.inject(SessionExpiredService);
    const fixture = TestBed.createComponent(App);

    sessionExpired.open();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector(
      '[data-testid="application-surface"]',
    ) as HTMLElement;

    expect(surface.hasAttribute('inert')).toBe(true);
    expect(surface.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    fixture.destroy();
  });
});
