import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthTokenStore } from '../../session/auth-token.store';
import { SessionExpiredService } from '../../session/session-expired.service';
import { SessionStore } from '../../session/session.store';
import { SessionExpiredDialogComponent } from './session-expired-dialog.component';

describe('SessionExpiredDialogComponent', () => {
  it('blocks the page, traps focus and exposes only the login action', async () => {
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    const tokenStore = { clear: vi.fn() };
    const sessionStore = { clearSession: vi.fn() };
    TestBed.configureTestingModule({
      imports: [SessionExpiredDialogComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthTokenStore, useValue: tokenStore },
        { provide: SessionStore, useValue: sessionStore },
      ],
    });
    const sessionExpired = TestBed.inject(SessionExpiredService);
    const fixture = TestBed.createComponent(SessionExpiredDialogComponent);

    sessionExpired.open();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('Tu sesión ha caducado');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toContain('Iniciar sesión');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tokenStore.clear).toHaveBeenCalledOnce();
    expect(sessionStore.clearSession).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(sessionExpired.isOpen()).toBe(false);

    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
