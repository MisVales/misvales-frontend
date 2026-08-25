import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChevronDown, CircleCheck, LucideAngularModule, UserRound, X } from 'lucide-angular';
import { RefactorSelectComponent, RefactorSelectOption } from './refactor-select.component';

@Component({
  standalone: true,
  imports: [FormsModule, RefactorSelectComponent],
  template: `<refactor-select label="Responsable" [options]="options" [(ngModel)]="value" />`,
})
class HostComponent {
  value: string | null = null;
  options: readonly RefactorSelectOption[] = [
    { value: 'ana', label: 'Ana López', icon: 'user-round' },
    { value: 'luis', label: 'Luis Pérez', disabled: true },
  ];
}

@Component({
  standalone: true,
  imports: [FormsModule, RefactorSelectComponent],
  template: `
    <refactor-select [(ngModel)]="value" (change)="recordChange()">
      <option value="" disabled>Elige una sucursal</option>
      <option value="north">Sucursal Norte</option>
      <option value="true" data-refactor-value-type="boolean">Sí</option>
    </refactor-select>
  `,
})
class ProjectedOptionsHostComponent {
  value: string | boolean | null = null;
  changes = 0;

  recordChange(): void {
    this.changes += 1;
  }
}

describe('RefactorSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HostComponent,
        ProjectedOptionsHostComponent,
        LucideAngularModule.pick({ ChevronDown, CircleCheck, UserRound, X }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('muestra la etiqueta y abre las opciones', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('.select-trigger')!;
    trigger.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Responsable');
    expect(element.querySelector('[role="listbox"]')).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('actualiza ngModel al elegir una opción', async () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.select-trigger')!.click();
    fixture.detectChanges();
    element.querySelectorAll<HTMLButtonElement>('.select-option')[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toBe('ana');
    expect(element.querySelector('.select-value')?.textContent).toContain('Ana López');
  });

  it('omite opciones deshabilitadas en la navegación con teclado', () => {
    const trigger = fixture.nativeElement.querySelector('.select-trigger') as HTMLButtonElement;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('ana');
  });

  it('convierte option proyectados en el menú custom y conserva sus tipos', async () => {
    const projectedFixture = TestBed.createComponent(ProjectedOptionsHostComponent);
    projectedFixture.detectChanges();
    await projectedFixture.whenStable();
    projectedFixture.detectChanges();
    const element = projectedFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('.select-trigger')!;

    expect(trigger.textContent).toContain('Elige una sucursal');
    trigger.click();
    projectedFixture.detectChanges();
    const options = element.querySelectorAll<HTMLButtonElement>('.select-option');
    expect(options).toHaveLength(3);

    options[2].click();
    projectedFixture.detectChanges();
    await projectedFixture.whenStable();
    expect(projectedFixture.componentInstance.value).toBe(true);
    expect(projectedFixture.componentInstance.changes).toBe(1);
  });
});
