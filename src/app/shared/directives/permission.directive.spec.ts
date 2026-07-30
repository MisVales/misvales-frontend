import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SessionStore } from '@core/session/session.store';

import { PermissionDirective } from './permission.directive';

@Component({
  imports: [PermissionDirective],
  template: `
    <button id="hidden" [mvPermission]="'item.view'">Ver</button>
    <button id="disabled" [mvPermission]="'item.edit'" mvPermissionPresentation="disable">
      Editar
    </button>
  `,
})
class PermissionHostComponent {}

describe('PermissionDirective', () => {
  it('denies by default and supports hidden and disabled presentation', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [PermissionHostComponent],
    }).createComponent(PermissionHostComponent);
    fixture.detectChanges();

    const hidden = fixture.nativeElement.querySelector('#hidden') as HTMLButtonElement;
    const disabled = fixture.nativeElement.querySelector('#disabled') as HTMLButtonElement;
    expect(hidden.hidden).toBe(true);
    expect(disabled.disabled).toBe(true);
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows and enables controls only with the requested permissions', () => {
    const session = TestBed.inject(SessionStore);
    session.establish({
      experience: 'administrativa',
      permissions: new Set(['item.view', 'item.edit']),
    });
    const fixture = TestBed.createComponent(PermissionHostComponent);
    fixture.detectChanges();

    const hidden = fixture.nativeElement.querySelector('#hidden') as HTMLButtonElement;
    const disabled = fixture.nativeElement.querySelector('#disabled') as HTMLButtonElement;
    expect(hidden.hidden).toBe(false);
    expect(disabled.disabled).toBe(false);
  });
});
