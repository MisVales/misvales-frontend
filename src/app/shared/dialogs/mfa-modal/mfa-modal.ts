import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MfaReauthService } from '../../../core/auth/services/mfa-reauth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-mfa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './mfa-modal.html',
})
export class MfaModal {
  mfaReauthService = inject(MfaReauthService);
  totpCode = signal('');

  submit() {
    if (this.totpCode().length === 6) {
      this.mfaReauthService.submitCode(this.totpCode());
      this.totpCode.set('');
    }
  }

  cancel() {
    this.mfaReauthService.cancel();
    this.totpCode.set('');
  }
}
