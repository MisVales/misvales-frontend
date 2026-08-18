import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subject, tap, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutosaveDirective } from './autosave.directive';

describe('AutosaveDirective', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes a collection creation before saving the next change', async () => {
    const creation = new Subject<{ id: string }>();
    let recordId: string | null = null;
    let createCalls = 0;
    let updateCalls = 0;
    const saveFn = vi.fn(() => {
      if (!recordId) {
        createCalls += 1;
        return creation.pipe(tap((response) => (recordId = response.id)));
      }

      updateCalls += 1;
      return of({ id: recordId });
    });
    const { directive, form } = setupDirective(saveFn);

    form.controls.value.setValue('primer cambio');
    await vi.advanceTimersByTimeAsync(2);
    form.controls.value.setValue('segundo cambio');
    await vi.advanceTimersByTimeAsync(2);

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(createCalls).toBe(1);
    expect(updateCalls).toBe(0);

    creation.next({ id: 'record-1' });
    creation.complete();

    expect(saveFn).toHaveBeenCalledTimes(2);
    expect(createCalls).toBe(1);
    expect(updateCalls).toBe(1);
    directive.ngOnDestroy();
  });

  it('persists a pending change while the directive is being destroyed', async () => {
    const saveFn = vi.fn(() => of({ ok: true }));
    const { directive, form } = setupDirective(saveFn, 100);

    form.controls.value.setValue('cambio pendiente');
    directive.ngOnDestroy();
    await vi.advanceTimersByTimeAsync(200);

    expect(saveFn).toHaveBeenCalledOnce();
    expect(directive.hasUnsavedChanges).toBe(false);
  });

  it('stops all later writes after an expired-session response', async () => {
    const saveFn = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );
    const { directive, form } = setupDirective(saveFn);

    form.controls.value.setValue('primer cambio');
    await vi.advanceTimersByTimeAsync(2);
    form.controls.value.setValue('segundo cambio');
    await vi.advanceTimersByTimeAsync(2);

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(directive.currentStatus).toBe('error');
    expect(directive.hasUnsavedChanges).toBe(true);
    expect(directive.flush()).toBeUndefined();
    directive.ngOnDestroy();
  });

  it('does not create a completely blank draft', () => {
    const saveFn = vi.fn(() => of({ ok: true }));
    const form = new FormGroup({ value: new FormControl('', { validators: [Validators.required] }) });
    const directive = TestBed.runInInjectionContext(() => new AutosaveDirective());
    directive.formGroup = form;
    directive.saveFn = saveFn;
    directive.hasUnsavedChanges = true;

    directive.flush();

    expect(saveFn).not.toHaveBeenCalled();
    expect(directive.currentStatus).toBe('idle');
  });

  it('persists a partial draft even if the section is still invalid', () => {
    const saveFn = vi.fn(() => of({ ok: true }));
    const form = new FormGroup({
      firstName: new FormControl('Daniel', { validators: [Validators.required] }),
      lastName: new FormControl('', { validators: [Validators.required] }),
    });
    const directive = TestBed.runInInjectionContext(() => new AutosaveDirective());
    directive.formGroup = form;
    directive.saveFn = saveFn;
    directive.hasUnsavedChanges = true;

    directive.flush()?.subscribe();

    expect(form.invalid).toBe(true);
    expect(saveFn).toHaveBeenCalledWith({ firstName: 'Daniel', lastName: '' });
    expect(directive.currentStatus).toBe('saved');
  });
});

function setupDirective(
  saveFn: (value: unknown) => Observable<unknown>,
  debounceMs = 1,
) {
  const form = new FormGroup({ value: new FormControl('', { nonNullable: true }) });
  const directive = TestBed.runInInjectionContext(() => new AutosaveDirective());
  directive.formGroup = form;
  directive.saveFn = saveFn;
  directive.debounceMs = debounceMs;
  directive.ngOnInit();
  return { directive, form };
}
