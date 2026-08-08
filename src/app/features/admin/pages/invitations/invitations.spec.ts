import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Invitations } from './invitations';
import { InvitationService } from '../../data-access/invitation.service';
import { RoleService } from '../../data-access/role.service';
import { ChevronLeft, ChevronRight, Loader2, LucideAngularModule, Plus, X } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';

describe('Invitations', () => {
  let component: Invitations;
  let fixture: ComponentFixture<Invitations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Invitations],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ Plus, Loader2, ChevronLeft, ChevronRight, X })),
        {
          provide: InvitationService,
          useValue: {
            getInvitations: () => of({
              data: [{
                id: 'invitation-1',
                user_id: 'user-1',
                user_email: 'usuario@example.com',
                user_name: 'Usuario Invitado',
                state: 'CONSUMED',
                expires_at: '2026-08-10T20:59:16.000000Z',
                inspected_at: '2026-08-08T20:59:25.000000Z',
                mfa_setup_completed_at: '2026-08-08T20:59:44.000000Z',
                attempt_count: 1,
                created_at: '2026-08-08T20:59:16.000000Z',
              }],
              current_page: 1,
              last_page: 1,
              total: 1,
            }),
          },
        },
        {
          provide: RoleService,
          useValue: { getRoles: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Invitations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el estado consumido devuelto por la API', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Consumida');
  });
});
