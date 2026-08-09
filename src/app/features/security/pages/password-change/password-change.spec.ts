import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordChange } from './password-change';
import { CheckCircle2, Circle, Loader2, LucideAngularModule } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { SecurityService } from '../../data-access/security.service';
import { AuthFacade } from '../../../auth/state/auth.facade';
import { vi } from 'vitest';

describe('PasswordChange', () => {
  let component: PasswordChange;
  let fixture: ComponentFixture<PasswordChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordChange],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ Loader2, Circle, CheckCircle2 })),
        { provide: SecurityService, useValue: { changePassword: vi.fn() } },
        { provide: AuthFacade, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordChange);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
