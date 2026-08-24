import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, LucideAngularModule],
  template: `
    <section
      class="empty-state"
      [class.empty-state--compact]="compact"
      role="status"
      [attr.aria-live]="loading ? 'polite' : null"
      [attr.aria-busy]="loading"
    >
      @if (loading) {
        <span class="loading-indicator" aria-hidden="true"><lucide-icon name="loader-2" /></span>
      } @else {
        <img
          [ngSrc]="variant === 1 ? '/no-found-1.png' : '/no-found-2.png'"
          [width]="variant === 1 ? 1536 : 1983"
          [height]="variant === 1 ? 1024 : 793"
          [priority]="priority"
          alt=""
        />
      }
      <h2>{{ title }}</h2>
      @if (message) {
        <p>{{ message }}</p>
      }
      @if (actionRoute && actionLabel) {
        <a [routerLink]="actionRoute">{{ actionLabel }}</a>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .empty-state {
      min-height: 17rem;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 0.45rem;
      padding: 1.5rem;
      color: var(--mv-text-muted);
      text-align: center;
    }
    img {
      width: min(17rem, 78%);
      height: 8.5rem;
      object-fit: contain;
    }
    .loading-indicator {
      display: grid;
      width: 3rem;
      height: 3rem;
      place-items: center;
      border-radius: 50%;
      background: var(--mv-primary-100);
      color: var(--mv-primary-700);
    }
    .loading-indicator lucide-icon { width: 1.5rem; height: 1.5rem; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .loading-indicator lucide-icon { animation-duration: 1.6s; }
    }
    h2,
    p {
      margin: 0;
    }
    h2 {
      color: var(--mv-text);
      font-size: 1rem;
    }
    p {
      max-width: 34rem;
      font-size: 0.76rem;
      line-height: 1.5;
    }
    a {
      min-height: 2.75rem;
      display: inline-flex;
      align-items: center;
      margin-top: 0.25rem;
      padding: 0.45rem 0.85rem;
      border-radius: 0.65rem;
      color: #fff;
      background: var(--mv-primary-700);
      font-size: 0.72rem;
      font-weight: 750;
      text-decoration: none;
    }
    .empty-state--compact {
      min-height: 10rem;
      padding: 1rem;
    }
    .empty-state--compact img {
      width: min(12rem, 70%);
      height: 5.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title = 'Sin información disponible';
  @Input() message = '';
  @Input() variant: 1 | 2 = 1;
  @Input() compact = false;
  @Input() priority = false;
  @Input() actionRoute = '';
  @Input() actionLabel = '';
  @Input() loading = false;
}
