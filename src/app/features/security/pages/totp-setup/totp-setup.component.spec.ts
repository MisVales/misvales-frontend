import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotpSetupComponent } from './totp-setup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TotpSetupComponent', () => {
  let component: TotpSetupComponent;
  let fixture: ComponentFixture<TotpSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotpSetupComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotpSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle secret visibility', () => {
    expect(component.isSecretVisible()).toBe(false);
    component.toggleSecretVisibility();
    expect(component.isSecretVisible()).toBe(true);
  });

  it('should prevent verification if form is invalid', () => {
    component.form.controls.code.setValue('123'); // invalid length
    component.verifyTotp();
    expect(component.isLoading()).toBe(false);
  });

  it('should set loading state on successful verify', async () => {
    component.form.controls.code.setValue('123456');
    component.verifyTotp();
    expect(component.isLoading()).toBe(true);
    await new Promise(r => setTimeout(r, 1500));
    expect(component.isLoading()).toBe(false);
  });
});
