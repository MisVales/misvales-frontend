import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [provideRouter([])]
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
    expect(component.filteredUsers().every(u => u.status === 'blocked')).toBe(true);
  });

  it('should show loading state when inviting user', () => {
    component.inviteEmail.set('test@test.com');
    component.inviteUser();
    expect(component.isActionLoading()).toBe('invite');
  });

  it('should toggle user block status', () => {
    const user = component.users()[0];
    component.openBlockModal(user);
    component.confirmBlock();
    expect(component.isActionLoading()).toBe(`block-${user.id}`);
  });
});
