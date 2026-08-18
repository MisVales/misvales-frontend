import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { catchError, concatMap, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { SessionExpiredService } from '../session/session-expired.service';

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
  private changeVersion = 0;
  private networkDisabled = false;

  ngOnInit() {
    if (!this.formGroup || !this.saveFn) return;

    this.sub.add(
      this.formGroup.valueChanges.pipe(
        tap(() => {
          this.changeVersion += 1;
          this.hasUnsavedChanges = true;
          this.updateStatus('idle'); // pending save
        }),
        debounceTime(this.debounceMs),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        map(() => this.changeVersion),
        concatMap((version) => this.persistCurrentValue(version)),
      ).subscribe(),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    // Las secciones del expediente se desmontan al cambiar de pestaña. Si el
    // usuario cambia antes del debounce, conserva el último valor en vez de
    // dejar una sección visualmente completa pero sin persistir.
    const pendingSave = this.flush();
    if (pendingSave) {
      pendingSave.subscribe();
    }
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

      return this.persistCurrentValue(this.changeVersion);
    }
  }

  private persistCurrentValue(version: number): Observable<any> {
    if (this.networkDisabled || this.sessionExpired.isOpen()) {
      this.updateStatus('error');
      return EMPTY;
    }

    const value = this.formGroup.getRawValue();
    if (!this.hasMeaningfulDraft(value)) {
      this.updateStatus('idle');
      return EMPTY;
    }

    this.updateStatus('saving');
    return this.saveFn(value).pipe(
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
        this.updateStatus('error');
        return EMPTY;
      }),
    );
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
