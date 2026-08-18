import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { ApplicationFormErrorStateDirective } from './application-form-error-state.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ApplicationFormErrorStateDirective],
  template: `
    <form [formGroup]="form" [appApplicationFormErrorState]="form">
      <input formControlName="name">
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
  });
}

describe('ApplicationFormErrorStateDirective', () => {
  it('marks a touched invalid control and clears its state when corrected', () => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.name.markAsTouched();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.classList.contains('app-application-control-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.form.controls.name.setValue('Ana');
    fixture.detectChanges();

    expect(input.classList.contains('app-application-control-invalid')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });
});
