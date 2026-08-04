import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TotpSetupComponent } from './totp-setup.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('TotpSetupComponent', () => {
  let component: TotpSetupComponent;
  let fixture: ComponentFixture<TotpSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotpSetupComponent, ReactiveFormsModule]
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
    expect(component.isSecretVisible()).toBeFalse();
    component.toggleSecretVisibility();
    expect(component.isSecretVisible()).toBeTrue();
  });

  it('should prevent verification if form is invalid', () => {
    component.form.controls.code.setValue('123'); // invalid length
    component.verifyTotp();
    expect(component.isLoading()).toBeFalse();
  });

  it('should set loading state on successful verify', fakeAsync(() => {
    component.form.controls.code.setValue('123456');
    component.verifyTotp();
    expect(component.isLoading()).toBeTrue();
    tick(1500);
    expect(component.isLoading()).toBeFalse();
  }));
});
