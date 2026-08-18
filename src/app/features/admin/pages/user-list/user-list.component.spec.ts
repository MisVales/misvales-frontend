import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AlertTriangle, Eye, Inbox, Loader2, Lock, LucideAngularModule, Plus } from 'lucide-angular';
import { SessionStore } from '../../../../core/session/session.store';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { RoleService } from '../../data-access/role.service';
import { UserService } from '../../data-access/user.service';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  const userService = {
    getUsers: () => of({ data: [], current_page: 1, total: 0 }),
    createAccount: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserListComponent,
        LucideAngularModule.pick({ AlertTriangle, Eye, Inbox, Loader2, Lock, Plus }),
      ],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: RoleService, useValue: { getRoles: () => of([]) } },
        { provide: OrganizationApiService, useValue: { getBranches: () => of([]) } },
        { provide: SessionStore, useValue: { permissions: () => ['users.view'] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('se crea y consulta el directorio', () => {
    expect(component).toBeTruthy();
    expect(component.totalUsers()).toBe(0);
  });

  it('rechaza una invitación con correo inválido', async () => {
    component.inviteName.set('Usuario');
    component.inviteEmail.set('correo-invalido');
    component.inviteRoleId.set('role-id');

    await component.inviteUser();

    expect(component.inviteError()).toContain('datos válidos');
    expect(userService.createAccount).not.toHaveBeenCalled();
  });
});
