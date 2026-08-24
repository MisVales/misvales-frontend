import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  it('describes the impact and emits an explicit confirmation', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Revocar rol');
    fixture.componentRef.setInput('message', 'La persona perderá sus capacidades.');
    const confirm = vi.fn();
    fixture.componentInstance.confirm.subscribe(confirm);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.confirm')?.click();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(confirm).toHaveBeenCalledOnce();
  });
});
