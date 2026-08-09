import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaModal } from './mfa-modal';

describe('MfaModal', () => {
  let component: MfaModal;
  let fixture: ComponentFixture<MfaModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaModal],
    }).compileComponents();

    fixture = TestBed.createComponent(MfaModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
