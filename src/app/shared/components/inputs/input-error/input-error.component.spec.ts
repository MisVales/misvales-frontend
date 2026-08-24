import { FormControl, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InputErrorComponent } from './input-error.component';

describe('InputErrorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InputErrorComponent] });
  });

  it('shows the RFC explanation when the validation is forced after a navigation attempt', () => {
    const control = new FormControl('RFC-FALSO');
    control.setErrors({ invalidRfc: true });

    const component = TestBed.createComponent(InputErrorComponent).componentInstance;
    component.control = control;
    component.label = 'El RFC';
    component.forceShow = true;

    expect(component.shouldShowErrors()).toBe(true);
    expect(component.getErrorMessages()).toEqual([
      'El formato del RFC es inválido (10 a 13 caracteres).',
    ]);
  });

  it('does not leave an empty error container once a forced control is valid', () => {
    const control = new FormControl('valor válido', Validators.required);
    const component = TestBed.createComponent(InputErrorComponent).componentInstance;
    component.control = control;
    component.forceShow = true;

    expect(component.shouldShowErrors()).toBe(false);
  });
});
