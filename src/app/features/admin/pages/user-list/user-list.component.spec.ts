import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter users by status', () => {
    component.filterStatus.set('blocked');
    // Ensure the computed signal updates
    expect(component.filteredUsers().every(u => u.status === 'blocked')).toBeTrue();
  });

  it('should show loading state when inviting user', () => {
    component.inviteEmail.set('test@test.com');
    component.inviteUser();
    expect(component.isActionLoading()).toBe('invite');
  });

  it('should toggle user block status', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const user = component.users()[0];
    component.toggleBlock(user);
    expect(component.isActionLoading()).toBe(`block-${user.id}`);
  });
});
