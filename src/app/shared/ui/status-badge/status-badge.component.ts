import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type StatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [attr.data-tone]="tone"><span class="dot" aria-hidden="true"></span><ng-content></ng-content></span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      border: 1px solid #dfe5e1;
      border-radius: 999px;
      background: #f6f8f7;
      color: #445047;
      padding: .2rem .6rem;
      font-size: .75rem;
      font-weight: 700;
      line-height: 1.35;
      white-space: nowrap;
    }
    .dot { width: .4rem; height: .4rem; border-radius: 50%; background: #7b8980; }
    [data-tone='info'] { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    [data-tone='info'] .dot { background: #3b82f6; }
    [data-tone='success'] { border-color: #bbddc2; background: #eff8f1; color: #2f5737; }
    [data-tone='success'] .dot { background: #4f825b; }
    [data-tone='warning'] { border-color: #f2d39b; background: #fff8e8; color: #8a5a14; }
    [data-tone='warning'] .dot { background: #d8921d; }
    [data-tone='danger'] { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
    [data-tone='danger'] .dot { background: #dc2626; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() tone: StatusBadgeTone = 'neutral';
}
