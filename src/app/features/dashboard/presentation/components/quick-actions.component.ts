import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { DashboardExperience, DashboardQuickAction } from '../../dashboard.models';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `@if (enabled && actions.length) {
    <section
      class="quick"
      [attr.data-experience]="experience"
      aria-labelledby="quick-actions-title"
    >
      <header>
        <span><lucide-icon name="activity" [size]="18" aria-hidden="true" /></span>
        <h2 id="quick-actions-title">Accesos rápidos</h2>
      </header>
      <nav aria-label="Accesos rápidos">
        @for (action of actions; track action.id) {
          <a [routerLink]="action.route">
            <span class="action-icon" aria-hidden="true"
              ><lucide-icon [name]="action.icon" [size]="22"
            /></span>
            <span class="action-copy"
              ><strong>{{ action.label }}</strong>
              @if (action.description) {
                <small>{{ action.description }}</small>
              }
            </span>
            <lucide-icon class="chevron" name="chevron-right" [size]="17" aria-hidden="true" />
          </a>
        }
      </nav>
    </section>
  }`,
  styles: `
    .quick {
      overflow: hidden;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-lg);
      background: var(--mv-surface);
      box-shadow: var(--mv-shadow-card);
    }
    header {
      min-height: 3.2rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid var(--mv-border);
    }
    header > span {
      color: var(--mv-primary-600);
    }
    h2 {
      margin: 0;
      font-size: 0.92rem;
    }
    nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
      gap: 0.7rem;
      padding: 0.85rem;
    }
    a {
      min-width: 0;
      min-height: 5.8rem;
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.7rem;
      padding: 0.8rem;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-md);
      color: var(--mv-text);
      text-decoration: none;
    }
    a:hover {
      border-color: var(--mv-primary-300);
      background: var(--mv-primary-50);
    }
    .action-icon {
      width: 2.6rem;
      height: 2.6rem;
      display: grid;
      place-items: center;
      border-radius: 0.8rem;
      color: var(--mv-primary-700);
      background: var(--mv-primary-100);
    }
    .action-copy {
      min-width: 0;
      display: grid;
      gap: 0.15rem;
    }
    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    strong {
      font-size: 0.8rem;
    }
    small {
      color: var(--mv-text-muted);
      font-size: 0.68rem;
    }
    .chevron {
      color: var(--mv-text-muted);
    }
    .quick[data-experience='mobile'] nav {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.4rem;
      padding: 0.65rem;
    }
    .quick[data-experience='mobile'] a {
      min-height: 5.2rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 0.35rem;
      padding: 0.55rem 0.2rem;
      text-align: center;
    }
    .quick[data-experience='mobile'] .action-copy {
      display: block;
    }
    .quick[data-experience='mobile'] strong {
      display: block;
      font-size: 0.66rem;
      line-height: 1.2;
      white-space: normal;
    }
    .quick[data-experience='mobile'] small,
    .quick[data-experience='mobile'] .chevron {
      display: none;
    }
    @media (max-width: 380px) {
      .quick[data-experience='mobile'] nav {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionsComponent {
  @Input() actions: readonly DashboardQuickAction[] = [];
  @Input() enabled = true;
  @Input() experience: DashboardExperience = 'desktop';
}
