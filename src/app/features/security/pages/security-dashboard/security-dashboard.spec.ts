import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityDashboard } from './security-dashboard';
import { provideRouter } from '@angular/router';
import { History, Key, LucideAngularModule, MonitorSmartphone, ShieldAlert, ShieldCheck, User } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';

describe('SecurityDashboard', () => {
  let component: SecurityDashboard;
  let fixture: ComponentFixture<SecurityDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityDashboard],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick({ User, Key, ShieldCheck, ShieldAlert, MonitorSmartphone, History })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SecurityDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
