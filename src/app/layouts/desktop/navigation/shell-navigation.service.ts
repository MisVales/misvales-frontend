import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShellNavigationService {
  readonly mobileMenuOpen = signal(false);

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }
}
