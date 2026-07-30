import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { TechnicalDialogComponent } from '@shared/dialogs/technical-dialog.component';
import { TechnicalFieldComponent } from '@shared/forms/technical-field.component';
import { ServerTableComponent, TableColumn } from '@shared/tables/server-table.component';

import { ActionButtonComponent } from './action-button.component';
import { UiStateComponent } from './ui-state.component';

interface Row {
  readonly name: string;
}

describe('shared technical components', () => {
  it('prevents a pending action from being submitted twice', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ActionButtonComponent],
    }).createComponent(ActionButtonComponent);
    fixture.componentRef.setInput('pending', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('renders support references without technical details', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UiStateComponent],
    }).createComponent(UiStateComponent);
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('requestId', 'request-123');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('request-123');
    expect(fixture.nativeElement.textContent).not.toContain('details');
  });

  it('renders every technical state and emits a retry action', () => {
    const fixture = TestBed.createComponent(UiStateComponent);
    fixture.componentRef.setInput('kind', 'loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando');

    fixture.componentRef.setInput('kind', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Operación completada');

    fixture.componentRef.setInput('kind', 'offline');
    fixture.componentRef.setInput('retryable', true);
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(retried).toBe(true);
  });

  it('requires the reinforced phrase and blocks confirmation while pending', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TechnicalDialogComponent],
    }).createComponent(TechnicalDialogComponent);
    fixture.componentRef.setInput('title', 'Eliminar');
    fixture.componentRef.setInput('message', 'Esta acción es sensible.');
    fixture.componentRef.setInput('kind', 'reinforced');
    fixture.componentRef.setInput('reinforcementPhrase', 'CONFIRMAR');
    fixture.detectChanges();

    expect(fixture.componentInstance.canConfirm()).toBe(false);
    fixture.componentInstance.reinforcement.set('CONFIRMAR');
    expect(fixture.componentInstance.canConfirm()).toBe(true);
    fixture.componentRef.setInput('pending', true);
    expect(fixture.componentInstance.canConfirm()).toBe(false);
  });

  it('renders typed field labels, help and backend validation', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TechnicalFieldComponent],
    }).createComponent(TechnicalFieldComponent);
    fixture.componentRef.setInput('control', new FormControl<boolean | null | string>(''));
    fixture.componentRef.setInput('name', 'email');
    fixture.componentRef.setInput('label', 'Correo electrónico');
    fixture.componentRef.setInput('kind', 'email');
    fixture.componentRef.setInput('help', 'Usa un correo vigente.');
    fixture.componentRef.setInput('serverErrors', ['El correo ya está registrado.']);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Correo electrónico');
    expect(fixture.nativeElement.textContent).toContain('El correo ya está registrado.');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toContain('email-error');
  });

  it('renders selection, radio, checkbox, textarea and decimal field wrappers', () => {
    const fixture = TestBed.createComponent(TechnicalFieldComponent);
    fixture.componentRef.setInput('control', new FormControl<boolean | null | string>(''));
    fixture.componentRef.setInput('name', 'technical');
    fixture.componentRef.setInput('label', 'Campo técnico');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('options', [
      { label: 'Uno', value: 'one' },
      { label: 'Dos', value: 'two' },
    ]);

    fixture.componentRef.setInput('kind', 'select');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('option')).toHaveLength(3);

    fixture.componentRef.setInput('kind', 'radio');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input[type=radio]')).toHaveLength(2);

    fixture.componentRef.setInput('kind', 'checkbox');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').type).toBe('checkbox');

    fixture.componentRef.setInput('kind', 'textarea');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();

    fixture.componentRef.setInput('kind', 'money');
    fixture.detectChanges();
    const moneyInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(moneyInput.inputMode).toBe('decimal');
    expect(fixture.componentInstance.inputType()).toBe('text');
  });

  it('emits server pagination and documented sorting without client pagination', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ServerTableComponent],
    }).createComponent(ServerTableComponent<Row>);
    const columns: readonly TableColumn<Row>[] = [{ key: 'name', label: 'Nombre', sortable: true }];
    fixture.componentRef.setInput('caption', 'Resultados');
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', [{ name: 'Registro' }]);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('perPage', 10);
    fixture.componentRef.setInput('total', 21);
    fixture.componentRef.setInput('sortEnabled', true);
    const pages: number[] = [];
    const directions: string[] = [];
    fixture.componentInstance.pageChange.subscribe((event) => pages.push(event.page));
    fixture.componentInstance.sortChange.subscribe((event) => directions.push(event.direction));
    fixture.detectChanges();

    fixture.componentInstance.move(1);
    fixture.componentInstance.sort(columns[0]);
    fixture.componentInstance.sort(columns[0]);

    expect(pages).toEqual([2]);
    expect(directions).toEqual(['asc', 'desc']);
    expect(fixture.componentInstance.lastPage()).toBe(3);
  });

  it('renders table loading, empty and error states and rejects invalid navigation', () => {
    const fixture = TestBed.createComponent(ServerTableComponent<Row>);
    fixture.componentRef.setInput('caption', 'Resultados');
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Nombre' }]);
    fixture.componentRef.setInput('rows', []);
    const pages: number[] = [];
    fixture.componentInstance.pageChange.subscribe((event) => pages.push(event.page));

    for (const [state, text] of [
      ['loading', 'Cargando resultados'],
      ['empty', 'No hay resultados'],
      ['error', 'No fue posible'],
    ] as const) {
      fixture.componentRef.setInput('state', state);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain(text);
    }

    fixture.componentRef.setInput('state', 'content');
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('total', 0);
    fixture.detectChanges();
    fixture.componentInstance.move(-1);
    fixture.componentInstance.move(1);
    fixture.componentInstance.sort({ key: 'name', label: 'Nombre', sortable: true });
    expect(pages).toEqual([]);
  });
});
