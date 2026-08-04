import { ChangeDetectionStrategy, Component, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recovery-codes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './recovery-codes.component.html',
  styleUrl: './recovery-codes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryCodesComponent {
  codes = signal<string[]>(['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890']);
  hasConfirmedSaved = signal(false);
  hasCopied = signal(false);

  copyCodes() {
    const text = this.codes().join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.hasCopied.set(true);
      setTimeout(() => this.hasCopied.set(false), 3000);
    });
  }

  canLeave(): boolean {
    if (this.hasConfirmedSaved()) {
      return true;
    }
    return window.confirm('No has confirmado que guardaste los códigos. ¿Seguro que quieres salir? Si los pierdes, podrías perder acceso a tu cuenta de forma permanente.');
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.hasConfirmedSaved()) {
      $event.returnValue = true;
    }
  }
}
