import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

export type BrandLockupVariant = 'primary' | 'compact' | 'horizontal';

@Component({
  selector: 'app-brand-lockup',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <a
      class="brand-lockup"
      [class.brand-lockup--compact]="compact"
      [class.brand-lockup--horizontal]="resolvedVariant === 'horizontal'"
      [routerLink]="link"
      aria-label="MisVales, ir al inicio"
    >
      @switch (resolvedVariant) {
        @case ('compact') {
          <img class="brand-lockup__logo" ngSrc="/imagotipo-vales.png" width="1504" height="1209" alt="" priority />
        }
        @case ('horizontal') {
          <img class="brand-lockup__logo" ngSrc="/imagotipo-vales2.png" width="1902" height="502" alt="" priority />
        }
        @default {
          <img class="brand-lockup__logo" ngSrc="/logo_misvales.png" width="832" height="491" alt="" priority />
        }
      }
    </a>
  `,
  styles: `
    :host {
      --brand-logo-size: 2.75rem;
      display: inline-flex;
      min-width: 0;
    }
    .brand-lockup {
      display: grid;
      width: var(--brand-logo-size);
      min-height: 44px;
      place-items: center;
      text-decoration: none;
    }
    .brand-lockup__logo {
      display: block;
      width: 100%;
      height: auto;
      max-width: 100%;
      border: 0;
      object-fit: contain;
      object-position: center;
      background: transparent;
    }
    .brand-lockup--compact {
      --brand-logo-size: 2.25rem;
    }
    .brand-lockup--horizontal {
      width: min(var(--brand-logo-width, 10rem), 100%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandLockupComponent {
  @Input() link = '/inicio';
  @Input() compact = false;
  @Input() variant: BrandLockupVariant = 'primary';

  protected get resolvedVariant(): BrandLockupVariant {
    return this.compact ? 'compact' : this.variant;
  }
}
