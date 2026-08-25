import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CircleCheck, Eye, EyeOff, Info, LucideAngularModule, Mail, X } from 'lucide-angular';
import { RefactorInputComponent, RefactorInputValidationRule } from './refactor-input.component';

@Component({
  standalone: true,
  imports: [FormsModule, RefactorInputComponent],
  template: `<refactor-input
    label="Correo"
    type="email"
    leadingIcon="mail"
    [clearable]="true"
    [maxLength]="40"
    [validationRules]="rules"
    [(ngModel)]="value"
  />`,
})
class HostComponent {
  value = '';
  rules: readonly RefactorInputValidationRule[] = [
    { label: 'Incluye @', test: (value) => value.includes('@') },
  ];
}

describe('RefactorInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HostComponent,
        LucideAngularModule.pick({ CircleCheck, Eye, EyeOff, Info, Mail, X }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('actualiza ngModel y el contador', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'persona@misvales.mx';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toBe('persona@misvales.mx');
    expect(fixture.nativeElement.querySelector('.input-counter').textContent).toContain('19/40');
  });

  it('limpia el valor desde la acción accesible', async () => {
    fixture.componentInstance.value = 'dato';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.input-action') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('');
  });

  it('renderiza textarea cuando se configura como multilinea', () => {
    const component = fixture.debugElement.children[0].componentInstance as RefactorInputComponent;
    component.multiline = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('textarea')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(
      (fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).style.maxHeight,
    ).toBe('240px');
  });

  it('reserva el espacio de retroalimentación y expone reglas en un tooltip accesible', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('.validation-trigger')!;
    const tooltip = element.querySelector<HTMLElement>('[role="tooltip"]')!;

    expect(element.querySelector('.input-feedback')).not.toBeNull();
    expect(tooltip.textContent).toContain('Incluye @');
    expect(trigger.getAttribute('aria-controls')).toBe(tooltip.id);
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
