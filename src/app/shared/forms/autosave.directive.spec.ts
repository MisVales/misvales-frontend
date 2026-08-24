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

  it('does not cancel an active save when the section is destroyed', async () => {
    const request = new Subject<{ ok: true }>();
    const saveFn = vi.fn(() => request.asObservable());
    const { directive, form } = setupDirective(saveFn, 1);

    form.controls.value.setValue('cambio');
    await vi.advanceTimersByTimeAsync(2);

    expect(directive.currentStatus).toBe('saving');
    directive.ngOnDestroy();

    request.next({ ok: true });
    request.complete();

    expect(directive.currentStatus).toBe('saved');
    expect(directive.hasUnsavedChanges).toBe(false);
  });

  it('saves the snapshot that triggered the debounced write', async () => {
    const requests: string[] = [];
    const saveFn = vi.fn((rawValue: unknown) => {
      const value = rawValue as { value: string };
      requests.push(value.value);
      return of({ ok: true });
    });
    const { directive, form } = setupDirective(saveFn, 10);

    form.controls.value.setValue('primer cambio');
    await vi.advanceTimersByTimeAsync(10);
    form.controls.value.setValue('segundo cambio');
    await vi.advanceTimersByTimeAsync(10);

    expect(requests).toEqual(['primer cambio', 'segundo cambio']);
    directive.ngOnDestroy();
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

  it('persists the valid fields of a draft while an invalid field is being corrected', () => {
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
    expect(saveFn).toHaveBeenCalledWith({ firstName: 'Daniel' });
    expect(directive.currentStatus).toBe('saved');
  });

  it('clears a server error as soon as its field is corrected', () => {
    const { directive, form } = setupDirective(() => of({ ok: true }));
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        error: {
          fields: { value: ['La fecha de inicio no puede ser posterior a hoy.'] },
        },
      },
    });

    (directive as any).applyServerErrors(error);
    expect(form.controls.value.hasError('server')).toBe(true);

    form.controls.value.setValue('2025-02-12');

    expect(form.controls.value.hasError('server')).toBe(false);
    directive.ngOnDestroy();
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
