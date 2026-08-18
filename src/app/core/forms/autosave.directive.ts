import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

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
  
  private sub = new Subscription();
  private lastSavedValue: any = null;

  ngOnInit() {
    if (!this.formGroup || !this.saveFn) return;

    this.lastSavedValue = this.formGroup.getRawValue();

    this.sub.add(
      this.formGroup.valueChanges.pipe(
        tap(() => {
          this.hasUnsavedChanges = true;
          this.updateStatus('idle'); // pending save
        }),
        debounceTime(this.debounceMs),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap(val => {
          this.updateStatus('saving');
          return this.saveFn(this.formGroup.getRawValue()).pipe(
            catchError(err => {
              this.updateStatus('error');
              return of(null);
            })
          );
        })
      ).subscribe(res => {
        if (res !== null) {
          this.updateStatus('saved');
          this.hasUnsavedChanges = false;
          this.lastSavedValue = this.formGroup.getRawValue();
        }
      })
    );
  }

  ngOnDestroy() {
    if (this.hasUnsavedChanges) {
      const flush$ = this.flush();
      if (flush$) flush$.subscribe();
    }
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
      this.updateStatus('saving');
      return this.saveFn(this.formGroup.getRawValue()).pipe(
        tap(res => {
          if (res !== null) {
            this.updateStatus('saved');
            this.hasUnsavedChanges = false;
            this.lastSavedValue = this.formGroup.getRawValue();
          }
        }),
        catchError(err => {
          this.updateStatus('error');
          return of(null);
        })
      );
    }
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
