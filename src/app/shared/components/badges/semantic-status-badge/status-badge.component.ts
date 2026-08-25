import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  AttachmentAnimationComponent,
  AttachmentAnimationType,
} from '@shared/components/media/attachment-animation/attachment-animation.component';

export type StatusBadgeTone = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'gray';

@Component({
  selector: 'refactor-status-badge',
  standalone: true,
  imports: [NgClass, AttachmentAnimationComponent],
  template: `<span class="badge" [ngClass]="tone">
    @if (animationType) {
      <refactor-attachment-animation [type]="animationType" [size]="18" />
    } @else if (icon) {
      <span class="icon" aria-hidden="true">{{ icon }}</span>
    }
    {{ label }}
  </span>`,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .badge {
        align-items: center;
        border-radius: 999px;
        display: inline-flex;
        font-size: 11px;
        font-weight: 700;
        gap: 5px;
        line-height: 1;
        padding: 6px 9px;
        white-space: nowrap;
      }
      .green {
        background: #e8f7ee;
        color: #08783f;
      }
      .orange {
        background: #fff3e6;
        color: #d76c00;
      }
      .blue {
        background: #eaf3ff;
        color: #1768ca;
      }
      .red {
        background: #fff0f0;
        color: #d52626;
      }
      .purple {
        background: #f2edff;
        color: #6747ba;
      }
      .gray {
        background: #eef0f3;
        color: #687386;
      }
      .icon {
        font-size: 9px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: StatusBadgeTone = 'gray';
  @Input() icon = '';
  @Input() animationType?: AttachmentAnimationType;
}
