import { TestBed } from '@angular/core/testing';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LucideAngularModule,
  OctagonAlert,
  X,
} from 'lucide-angular';
import { describe, expect, it, vi } from 'vitest';
import { AlertService } from '../alert.service';
import { AlertComponent } from './alert.component';

describe('AlertComponent accessibility', () => {
  it('announces errors assertively and exposes a named close button', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [
        AlertComponent,
        LucideAngularModule.pick({ AlertTriangle, CheckCircle2, Info, OctagonAlert, X }),
      ],
    });
    const alerts = TestBed.inject(AlertService);
    const fixture = TestBed.createComponent(AlertComponent);

    alerts.showAlert('No fue posible guardar.', 'error', 0);
    fixture.detectChanges();

    const liveRegion = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    const closeButton = liveRegion.querySelector('button') as HTMLButtonElement;

    expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
    expect(closeButton.type).toBe('button');
    expect(closeButton.getAttribute('aria-label')).toBe('Cerrar aviso: No fue posible guardar.');

    closeButton.click();
    vi.advanceTimersByTime(220);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    vi.useRealTimers();
  });

  it('announces non-critical feedback politely', () => {
    TestBed.configureTestingModule({
      imports: [
        AlertComponent,
        LucideAngularModule.pick({ AlertTriangle, CheckCircle2, Info, OctagonAlert, X }),
      ],
    });
    const alerts = TestBed.inject(AlertService);
    const fixture = TestBed.createComponent(AlertComponent);

    alerts.showAlert('Cambios guardados.', 'success', 0);
    fixture.detectChanges();

    const liveRegion = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.classList.contains('app-toast--success')).toBe(true);
  });
});
