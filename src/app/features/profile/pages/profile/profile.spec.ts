import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile } from './profile';
import { Building2, LucideAngularModule, User } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { SessionStore } from '../../../../core/session/session.store';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ User, Building2 })),
        { provide: SessionStore, useValue: { user: () => null, scopes: () => [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
