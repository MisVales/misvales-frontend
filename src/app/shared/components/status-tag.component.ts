import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'mv-status-tag',
  template: `<span class="tag"><span class="marker" aria-hidden="true"></span>{{ text() }}</span>`,
  styles: `
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border-radius: 999px;
      background: var(--mv-mint);
      padding: 0.35rem 0.65rem;
      color: #173f1b;
      font-weight: 700;
    }
    .marker {
      width: 0.55rem;
      height: 0.55rem;
      border: 2px solid currentColor;
      border-radius: 50%;
      background: var(--mv-green-medium);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  readonly text = input.required<string>();
}
