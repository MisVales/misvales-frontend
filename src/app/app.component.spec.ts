import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';
import { RequestActivityService } from './core/observability/request-activity.service';
import { SessionExpiredService } from './core/session/session-expired.service';

describe('App session expiration host', () => {
  it('announces global request activity without covering the application surface', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });
    const activity = TestBed.inject(RequestActivityService);
    const fixture = TestBed.createComponent(AppComponent);

    activity.visible.set(true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Actualizando información',
    );
    expect(element.querySelector('.activity-track--visible')).not.toBeNull();
    expect(element.querySelector('[data-testid="application-surface"]')).not.toBeNull();
  });

  it('makes the application surface inert while the single global dialog is open', async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });
    const sessionExpired = TestBed.inject(SessionExpiredService);
    const fixture = TestBed.createComponent(AppComponent);

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
