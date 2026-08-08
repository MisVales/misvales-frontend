import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckCircle, Loader2, LucideAngularModule } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SecurityService } from '../../data-access/security.service';
import { TotpSetupComponent } from './totp-setup.component';

describe('TotpSetupComponent', () => {
  let component: TotpSetupComponent;
  let fixture: ComponentFixture<TotpSetupComponent>;
  const securityService = {
    getTotpSetup: vi.fn().mockReturnValue(of({
      totp_secret: 'SECRET',
      totp_uri: 'otpauth://totp/MisVales:test@example.com?secret=SECRET',
    })),
    confirmTotpSetup: vi.fn().mockReturnValue(of({ message: 'Configurado' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TotpSetupComponent],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ Loader2, CheckCircle })),
        { provide: SecurityService, useValue: securityService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TotpSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('obtiene la configuración únicamente mediante el servicio propio', () => {
    expect(component).toBeTruthy();
    expect(securityService.getTotpSetup).toHaveBeenCalledOnce();
    expect(component.secret()).toBe('SECRET');
  });

  it('alterna la visibilidad del secreto', () => {
    component.toggleSecretVisibility();
    expect(component.isSecretVisible()).toBe(true);
  });

  it('no confirma un formulario inválido', async () => {
    component.form.controls.code.setValue('123');
    await component.verifyTotp();
    expect(securityService.confirmTotpSetup).not.toHaveBeenCalled();
  });

  it('confirma un código válido y limpia los secretos', async () => {
    component.form.setValue({ password: 'current-password', code: '123456' });
    await component.verifyTotp();
    expect(securityService.confirmTotpSetup).toHaveBeenCalledWith({
      current_password: 'current-password',
      new_totp_code: '123456',
    });
    expect(component.success()).toBe(true);
    expect(component.secret()).toBe('');
  });
});
