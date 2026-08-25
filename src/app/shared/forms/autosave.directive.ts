import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { catchError, concatMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SessionExpiredService } from '@core/session/session-expired.service';
import { apiValidationErrors } from '@core/api/api-error';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Directive({
  selector: '[appAutosave]',
  standalone: true,
  exportAs: 'appAutosave'
})
export class AutosaveDirective implements OnInit, OnDestroy {
  @Input('appAutosave') formGroup!: FormGroup;
  @Input() saveFn!: (val: any) => Observable<any>;
  @Input() debounceMs = 800;
  
  @Output() statusChange = new EventEmitter<AutosaveStatus>();

  public currentStatus: AutosaveStatus = 'idle';
  public hasUnsavedChanges = false;

  private readonly sessionExpired = inject(SessionExpiredService);
  private sub = new Subscription();
  private readonly saveQueue$ = new Subject<{ value: Record<string, unknown>; version: number }>();
  private saveQueueSub = new Subscription();
  private changeVersion = 0;
  private lastQueuedVersion = 0;
  private queueInitialized = false;
  private networkDisabled = false;

  ngOnInit() {
    if (!this.formGroup || !this.saveFn) return;
    this.saveQueueSub.add(
      this.saveQueue$.pipe(
        concatMap(({ value, version }) => this.persistValue(value, version)),
      ).subscribe(),
    );
    this.queueInitialized = true;

    Object.entries(this.formGroup.controls).forEach(([field, control]) => {
      this.sub.add(control.valueChanges.subscribe(() => this.clearServerError(field)));
    });

    this.sub.add(
      this.formGroup.valueChanges.pipe(
        tap(() => {
          this.changeVersion += 1;
          this.hasUnsavedChanges = true;
          this.updateStatus('idle'); // pending save
        }),
        debounceTime(this.debounceMs),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      ).subscribe((value) => this.enqueueSave(value, this.changeVersion)),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    // Las secciones del expediente se desmontan al cambiar de pestaña. Si el
    // usuario cambia antes del debounce, conserva el último valor en vez de
    // dejar una sección visualmente completa pero sin persistir.
    // No se cancela saveQueueSub: si ya había una petición HTTP activa, debe
    // terminar aunque la pestaña destruya la vista. El Subject se completa
    // después de encolar el último snapshot y concatMap deja drenar la cola.
    this.flush();
    this.saveQueue$.complete();
  }

  private updateStatus(status: AutosaveStatus) {
    this.currentStatus = status;
    this.statusChange.emit(status);
  }

  /**
   * Forces an immediate save of unsaved changes.
   * Useful when changing tabs or routes.
   */
  public flush(): Observable<any> | void {
    if (this.hasUnsavedChanges) {
      if (this.networkDisabled || this.sessionExpired.isOpen()) {
        this.updateStatus('error');
        return;
      }

      if (!this.queueInitialized) {
        return this.persistValue(this.formGroup.getRawValue(), this.changeVersion);
      }

      if (this.changeVersion > this.lastQueuedVersion || this.currentStatus !== 'saving') {
        this.enqueueSave(this.formGroup.getRawValue(), this.changeVersion);
      }

      // La persistencia se ejecuta en saveQueueSub. Se conserva el contrato
      // observable para los consumidores existentes de flush().
      return EMPTY;
    }
  }

  private enqueueSave(value: Record<string, unknown>, version: number): void {
    if (version < this.lastQueuedVersion) return;

    this.lastQueuedVersion = version;
    this.saveQueue$.next({ value, version });
  }

  private persistValue(value: Record<string, unknown>, version: number): Observable<any> {
    if (this.networkDisabled || this.sessionExpired.isOpen()) {
      this.updateStatus('error');
      return EMPTY;
    }

    if (!this.hasMeaningfulDraft(value)) {
      this.updateStatus('idle');
      return EMPTY;
    }

    this.updateStatus('saving');
    return this.saveFn(this.withoutInvalidFields(value)).pipe(
      tap((result) => {
        if (result !== null) {
          this.updateStatus('saved');
          if (this.changeVersion === version) {
            this.hasUnsavedChanges = false;
          }
        }
      }),
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 419)
        ) {
          this.networkDisabled = true;
        }
        this.applyServerErrors(error);
        this.updateStatus('error');
        return EMPTY;
      }),
    );
  }

  /**
   * Mantiene el avance ya válido mientras otro campo aún está en edición.
   * El valor inválido queda exclusivamente en el formulario hasta que la
   * persona termine de corregirlo; no se envía como una actualización parcial.
   */
  private withoutInvalidFields(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(value).filter(([field]) => !this.formGroup.get(field)?.invalid));
  }

  private applyServerErrors(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) return;

    Object.entries(apiValidationErrors(error)).forEach(([field, messages]) => {
      const controlName = this.controlNameForServerField(field);
      const control = this.formGroup.get(controlName);
      if (!control) return;

      control.setErrors({ ...(control.errors ?? {}), server: messages.join(' ') });
      control.markAsTouched();
    });
  }

  private clearServerError(field: string): void {
    const control = this.formGroup.get(field);
    if (!control?.hasError('server')) return;

    const errors = { ...(control.errors ?? {}) };
    delete errors['server'];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private controlNameForServerField(field: string): string {
    return {
      'details_payload.proof_type': 'proof_type',
      'details_payload.description': 'other_description',
    }[field] ?? field;
  }

  /**
   * Los formularios de expediente se guardan por secciones mientras se llenan.
   * Evita crear un registro al abrir una sección, pero conserva cualquier dato
   * real aunque todavía falten campos requeridos para enviar el expediente.
   */
  private hasMeaningfulDraft(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) => this.hasMeaningfulDraft(item));
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).some(([key, item]) => {
        if (key === 'id') {
          return typeof item === 'string' && item.length > 0;
        }

        return this.hasMeaningfulDraft(item);
      });
    }

    return value !== false;
  }

  /**
   * Previene la recarga accidental si hay cambios sin guardar
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges || this.currentStatus === 'saving') {
      $event.returnValue = true;
    }
  }
}
