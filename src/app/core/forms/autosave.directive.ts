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

    this.updateStatus('saving');
    return this.saveFn(this.formGroup.getRawValue()).pipe(
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
   * Previene la recarga accidental si hay cambios sin guardar
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges || this.currentStatus === 'saving') {
      $event.returnValue = true;
    }
  }
}
