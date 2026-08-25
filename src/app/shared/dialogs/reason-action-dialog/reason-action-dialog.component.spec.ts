import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ReasonActionDialogComponent } from './reason-action-dialog.component';

describe('ReasonActionDialogComponent', () => {
  it('requires a reason before enabling the controlled action', async () => {
    await TestBed.configureTestingModule({ imports: [ReasonActionDialogComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ReasonActionDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Publicar versión');
    fixture.componentRef.setInput('message', 'La versión será vigente globalmente.');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.confirm')?.disabled).toBe(true);

    fixture.componentRef.setInput('reason', 'Cambio autorizado');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.confirm')?.disabled).toBe(false);
  });
});
