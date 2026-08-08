import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MfaReauthService {
  isModalOpen = signal(false);
  private codeSubject: Subject<string | null> | null = null;

  requestMfaCode(): Promise<string> {
    this.isModalOpen.set(true);
    this.codeSubject = new Subject<string | null>();
    
    return new Promise((resolve, reject) => {
      this.codeSubject!.subscribe(code => {
        if (code !== null) {
          resolve(code);
        } else {
          reject(new Error('User cancelled MFA reauth'));
        }
        this.isModalOpen.set(false);
        this.codeSubject = null;
      });
    });
  }

  submitCode(code: string) {
    this.codeSubject?.next(code);
  }

  cancel() {
    this.codeSubject?.next(null);
  }
}
