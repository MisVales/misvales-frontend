import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { RefactorInputComponent } from '@shared/components/inputs/refactor-input/refactor-input.component';
import { StatusBadgeComponent } from '@shared/components/badges/semantic-status-badge/status-badge.component';
import {
  AttachmentAnimationComponent,
  AttachmentAnimationType,
} from '@shared/components/media/attachment-animation/attachment-animation.component';
import { ActionConfig, MenuItem, Tone, VerificationStatus } from '../../models/verification.models';

const SHARED = '../../styles/verification-tokens.css';
const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pendiente',
  visiting: 'En visita',
  evidence: 'Con evidencia',
  differences: 'Con diferencias',
  'to-send': 'Por enviar',
  completed: 'Completado',
  'no-differences': 'Sin diferencias',
  review: 'En revisión',
  consultable: 'Consultable',
  required: 'Obligatoria',
  'not-applicable': 'No aplica',
};
const STATUS_TONES: Record<VerificationStatus, Tone> = {
  pending: 'orange',
  visiting: 'blue',
  evidence: 'green',
  differences: 'red',
  'to-send': 'purple',
  completed: 'green',
  'no-differences': 'green',
  review: 'blue',
  consultable: 'blue',
  required: 'green',
  'not-applicable': 'gray',
};

@Component({
  selector: 'verification-status-badge',
  standalone: true,
  imports: [StatusBadgeComponent],
  styleUrls: [SHARED],
  template: `<refactor-status-badge
    [label]="label || labels[status]"
    [tone]="tone"
    [icon]="animationType ? '' : icon"
    [animationType]="animationType"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationStatusBadgeComponent {
  @Input() status: VerificationStatus = 'pending';
  @Input() label = '';
  @Input() icon = '●';
  protected readonly labels = STATUS_LABELS;
  get animationType(): AttachmentAnimationType | undefined {
    if (this.status === 'pending') return 'clock';
    if (this.status === 'evidence') return 'folder';
    return undefined;
  }
  get tone(): Tone {
    return STATUS_TONES[this.status];
  }
}

@Component({
  selector: 'verification-app-button',
  standalone: true,
  styleUrls: [SHARED],
  template: `@if (!readOnly) {
    <button
      class="v-button {{ variant }}"
      [class.sm]="size === 'sm'"
      [class.lg]="size === 'lg'"
      [disabled]="disabled || loading"
      [attr.type]="type"
      (click)="pressed.emit()"
    >
      <span aria-hidden="true">{{ loading ? '◌' : icon }}</span
      ><ng-content></ng-content>
    </button>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  @Input() variant: ActionConfig['variant'] = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() readOnly = false;
  @Output() readonly pressed = new EventEmitter<void>();
}

@Component({
  selector: 'verification-icon-button',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .icon-button {
        align-items: center;
        background: #fff;
        border: 1px solid var(--v-line);
        border-radius: 50%;
        cursor: pointer;
        display: inline-flex;
        height: 40px;
        justify-content: center;
        position: relative;
        width: 40px;
      }
      .count {
        background: var(--v-green);
        border: 2px solid #fff;
        border-radius: 99px;
        color: #fff;
        font-size: 9px;
        font-weight: 800;
        min-width: 18px;
        padding: 2px;
        position: absolute;
        right: -3px;
        top: -5px;
      }
    `,
  ],
  template: `<button
    class="icon-button"
    type="button"
    [attr.aria-label]="ariaLabel"
    [disabled]="disabled"
    (click)="pressed.emit()"
  >
    <span aria-hidden="true">{{ icon }}</span>
    @if (badge) {
      <span class="count">{{ badge }}</span>
    }
  </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  @Input({ required: true }) ariaLabel = '';
  @Input() icon = '?';
  @Input() badge: string | number | undefined;
  @Input() disabled = false;
  @Output() readonly pressed = new EventEmitter<void>();
}

@Component({
  selector: 'verification-user-avatar',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .avatar {
        align-items: center;
        background: var(--v-green-soft);
        border-radius: 50%;
        color: var(--v-green);
        display: flex;
        font-weight: 800;
        height: 42px;
        justify-content: center;
        overflow: hidden;
        width: 42px;
      }
      .avatar img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  template: `<span class="avatar" [attr.aria-label]="name">
    @if (image) {
      <img [src]="image" [alt]="name" />
    } @else {
      {{ initials }}
    }
  </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  @Input() initials = 'CR';
  @Input() image = '';
  @Input() name = 'Usuario';
}

@Component({
  selector: 'verification-filter-pill',
  standalone: true,
  imports: [CommonModule, AttachmentAnimationComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .pill {
        align-items: center;
        background: #fff;
        border: 1px solid var(--v-line);
        border-radius: 999px;
        color: var(--v-ink);
        cursor: pointer;
        display: flex;
        gap: 9px;
        min-height: 44px;
        padding: 7px 13px;
        width: 100%;
      }
      .selected {
        background: linear-gradient(90deg, #eef9f2, #fff);
        border-color: var(--v-green);
        color: var(--v-green);
      }
      .count {
        background: #f2f4f5;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 800;
        margin-left: auto;
        padding: 4px 8px;
      }
    `,
  ],
  template: `<button
    class="pill"
    [class.selected]="selected"
    [disabled]="disabled"
    type="button"
    (click)="chosen.emit()"
  >
    @if (animationType) {
      <refactor-attachment-animation [type]="animationType" [size]="26" />
    } @else {
      <span aria-hidden="true">{{ icon }}</span>
    }
    <strong>{{ label }}</strong>
    @if (count !== undefined) {
      <span class="count">{{ count }}</span>
    }
  </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPillComponent {
  @Input() icon = '☷';
  @Input() animationType?: AttachmentAnimationType;
  @Input({ required: true }) label = '';
  @Input() count?: number;
  @Input() selected = false;
  @Input() disabled = false;
  @Output() readonly chosen = new EventEmitter<void>();
}

@Component({
  selector: 'verification-stat-card',
  standalone: true,
  imports: [AttachmentAnimationComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .stat {
        align-items: center;
        display: grid;
        gap: 12px;
        grid-template-columns: 52px 1fr;
        padding: 16px;
      }
      .icon {
        align-items: center;
        background: var(--v-green-soft);
        border-radius: 15px;
        color: var(--v-green);
        display: flex;
        font-size: 24px;
        height: 52px;
        justify-content: center;
      }
      .stat.orange .icon {
        background: #fff3e6;
        color: var(--v-orange);
      }
      .stat.blue .icon {
        background: #eef5ff;
        color: var(--v-blue);
      }
      .stat.red .icon {
        background: #fff0f0;
        color: var(--v-red);
      }
      .stat.purple .icon {
        background: #f3efff;
        color: var(--v-purple);
      }
      small {
        color: var(--v-muted);
      }
      strong {
        display: block;
        font-size: 21px;
        margin: 3px 0;
      }
    `,
  ],
  template: `<article class="v-card stat {{ tone }}">
    <span class="icon" aria-hidden="true">
      @if (animationType) {
        <refactor-attachment-animation [type]="animationType" [size]="42" />
      } @else {
        {{ icon }}
      }
    </span>
    <div>
      <small>{{ label }}</small
      ><strong>{{ value }}</strong
      ><small>{{ description }}</small>
    </div>
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationStatCardComponent {
  @Input() icon = '☷';
  @Input() animationType?: AttachmentAnimationType;
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() description = '';
  @Input() tone: Tone = 'green';
}

@Component({
  selector: 'verification-page-context-header',
  standalone: true,
  imports: [VerificationStatusBadgeComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .context {
        align-items: flex-start;
        display: flex;
        gap: 20px;
        justify-content: space-between;
      }
      .copy {
        min-width: 0;
      }
      .head {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }
      .mark {
        align-items: center;
        border: 2px solid var(--v-green);
        border-radius: 50%;
        color: var(--v-green);
        display: flex;
        font-size: 20px;
        height: 42px;
        justify-content: center;
        width: 42px;
      }
      h1 {
        font-size: clamp(26px, 3vw, 38px);
        letter-spacing: -0.04em;
        margin: 0;
      }
      .subtitle {
        color: var(--v-muted);
        margin: 8px 0 0;
      }
      .eyebrow {
        color: var(--v-green);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        margin: 0 0 7px;
        text-transform: uppercase;
      }
      .actions {
        align-items: center;
        display: flex;
        flex: 0 0 auto;
        gap: 10px;
      }
      .actions:empty {
        display: none;
      }
      .folio {
        background: #f1f3f5;
        border-radius: 9px;
        font-weight: 750;
        padding: 7px 10px;
      }
      @media (max-width: 640px) {
        .context {
          flex-direction: column;
        }
        .actions {
          width: 100%;
        }
      }
    `,
  ],
  template: `<header class="context">
    <div class="copy">
      @if (eyebrow) {
        <p class="eyebrow">{{ eyebrow }}</p>
      }
      <div class="head">
        @if (icon) {
          <span class="mark">{{ icon }}</span>
        }
        <h1>{{ title }}</h1>
        @if (folio) {
          <span class="folio">{{ folio }}</span>
        }
        @if (status) {
          <verification-status-badge [status]="status" />
        }
      </div>
      @if (subtitle) {
        <p class="subtitle">{{ subtitle }}</p>
      }
    </div>
    <div class="actions"><ng-content /></div>
  </header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContextHeaderComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() folio = '';
  @Input() status?: VerificationStatus;
  @Input() icon = '';
}

@Component({
  selector: 'verification-info-banner',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .banner {
        align-items: flex-start;
        background: #edf5ff;
        border: 1px solid #bfdcff;
        border-radius: 10px;
        color: #1657a6;
        display: flex;
        gap: 11px;
        padding: 13px 15px;
      }
      .success {
        background: #edf9f1;
        border-color: #bce6ca;
        color: #08783f;
      }
      .warning {
        background: #fff7eb;
        border-color: #ffd9a5;
        color: #a85a00;
      }
      .error {
        background: #fff1f1;
        border-color: #ffc5c5;
        color: #c72323;
      }
      .copy {
        flex: 1;
      }
      .copy strong {
        display: block;
        margin-bottom: 3px;
      }
      .close {
        background: transparent;
        border: 0;
        cursor: pointer;
      }
    `,
  ],
  template: `@if (visible) {
    <aside class="banner {{ variant }}" role="status">
      <span aria-hidden="true">{{ icon }}</span>
      <div class="copy">
        @if (title) {
          <strong>{{ title }}</strong>
        }
        <span>{{ message }}</span>
      </div>
      @if (dismissible) {
        <button class="close" aria-label="Cerrar" (click)="visible = false">×</button>
      }
    </aside>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationBannerComponent {
  @Input() variant: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() icon = 'ⓘ';
  @Input() title = '';
  @Input({ required: true }) message = '';
  @Input() dismissible = false;
  protected visible = true;
}

@Component({
  selector: 'verification-section-card',
  standalone: true,
  imports: [VerificationStatusBadgeComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .section {
        height: 100%;
        padding: 18px;
      }
      .heading {
        align-items: center;
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      .heading h3 {
        font-size: 16px;
        margin: 0;
      }
      .heading verification-status-badge {
        margin-left: auto;
      }
      .disabled {
        background: #fafafa;
        color: #687386;
      }
    `,
  ],
  template: `<section class="v-card section" [class.disabled]="disabled">
    <header class="heading">
      <h3>
        @if (number) {
          <span>{{ number }}. </span>
        }
        {{ title }}
      </h3>
      @if (status) {
        <verification-status-badge [status]="status" />
      }
    </header>
    <ng-content></ng-content>
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  @Input() number?: number;
  @Input({ required: true }) title = '';
  @Input() status?: VerificationStatus;
  @Input() disabled = false;
}

@Component({
  selector: 'verification-empty-state',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .empty {
        align-items: center;
        color: var(--v-muted);
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 130px;
        text-align: center;
      }
      .illustration { height: 96px; max-width: min(260px, 78%); object-fit: contain; width: 100%; }
      .empty h4 {
        color: var(--v-ink);
        margin: 10px 0 4px;
      }
      .empty p {
        margin: 0;
      }
    `,
  ],
  template: `<div class="empty">
    <img
      class="illustration"
      [src]="variant === 1 ? '/no-found-1.png' : '/no-found-2.png'"
      alt=""
      aria-hidden="true"
    />
    @if (title) {
      <h4>{{ title }}</h4>
    }
    <p>{{ description }}</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = '▧';
  @Input() iconAsset = '';
  @Input() title = '';
  @Input() description = 'Sin información disponible.';
  @Input() variant: 1 | 2 = 2;
}

@Component({
  selector: 'verification-character-textarea',
  standalone: true,
  imports: [FormsModule, RefactorInputComponent],
  styleUrls: [SHARED],
  styles: [
    `
      :host {
        display: block;
      }
      .wrap {
        position: relative;
      }
      textarea {
        min-height: 105px;
        resize: vertical;
      }
      .counter {
        bottom: 9px;
        color: var(--v-muted);
        font-size: 10px;
        position: absolute;
        right: 10px;
      }
      .error {
        color: var(--v-red);
        font-size: 11px;
        margin-top: 4px;
      }
      .helper {
        color: var(--v-muted);
        font-size: 11px;
        margin-top: 4px;
      }
    `,
  ],
  template: `<refactor-input
    [multiline]="true"
    [ngModel]="value"
    [ngModelOptions]="{ standalone: true }"
    (ngModelChange)="update($event)"
    [maxLength]="maxLength"
    [placeholder]="placeholder"
    [required]="required"
    [readonly]="readonly"
    [disabled]="disabled"
    [invalid]="!!error"
    [errorMessage]="error"
    [hint]="helperText"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCounterTextareaComponent {
  @Input() value = '';
  @Input() maxLength = 500;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() error = '';
  @Input() helperText = '';
  @Output() readonly valueChange = new EventEmitter<string>();
  protected update(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}

@Component({
  selector: 'verification-validation-message',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .message {
        background: #fff1f1;
        border: 1px solid #ffcaca;
        border-radius: 10px;
        color: #c72323;
        display: flex;
        gap: 10px;
        padding: 13px;
      }
      .info {
        background: #eef6ff;
        border-color: #c8ddfa;
        color: #1768ca;
      }
      .warning {
        background: #fff7eb;
        border-color: #ffdda9;
        color: #a85a00;
      }
      .success {
        background: #edf9f1;
        border-color: #bce6ca;
        color: #08783f;
      }
      .message strong {
        display: block;
        margin-bottom: 5px;
      }
      .message p {
        color: var(--v-muted);
        margin: 0;
      }
    `,
  ],
  template: `<aside class="message {{ variant }}">
    <span aria-hidden="true">{{ icon }}</span>
    <div>
      <strong>{{ title }}</strong>
      @if (description) {
        <p>{{ description }}</p>
      }
    </div>
  </aside>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationMessageComponent {
  @Input() variant: 'info' | 'warning' | 'error' | 'success' = 'error';
  @Input() icon = '⚠';
  @Input({ required: true }) title = '';
  @Input() description = '';
}

@Component({
  selector: 'verification-action-footer',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .actions {
        align-items: center;
        background: rgb(255 255 255 / 94%);
        border-top: 1px solid var(--v-line);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 14px;
      }
      .sticky {
        bottom: 0;
        position: sticky;
        z-index: 5;
      }
    `,
  ],
  template: `@if (!readOnly) {
    <footer class="actions" [class.sticky]="sticky">
      @for (action of actions; track action.id) {
        <verification-app-button
          [variant]="action.variant"
          [disabled]="!!action.disabled"
          [loading]="!!action.loading"
          (pressed)="actionPressed.emit(action.id)"
          >{{ action.label }}</verification-app-button
        >
      }
    </footer>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionFooterComponent {
  @Input() actions: readonly ActionConfig[] = [];
  @Input() sticky = false;
  @Input() readOnly = true;
  @Output() readonly actionPressed = new EventEmitter<string>();
}

@Component({
  selector: 'verification-user-menu',
  standalone: true,
  imports: [LucideAngularModule],
  styleUrls: [SHARED],
  styles: [
    `
      .menu {
        box-sizing: border-box;
        padding: 8px;
        width: 100%;
      }
      .menu button {
        align-items: center;
        background: transparent;
        border: 0;
        border-bottom: 1px solid #eef0f2;
        border-radius: 7px;
        color: var(--v-ink);
        cursor: pointer;
        display: flex;
        gap: 10px;
        min-height: 44px;
        padding: 12px;
        text-align: left;
        width: 100%;
      }
      .menu button:hover {
        background: var(--v-green-soft);
        color: var(--v-green);
      }
      .menu button:focus-visible {
        outline: 2px solid var(--v-green);
        outline-offset: -2px;
      }
      .menu button:last-child {
        border: 0;
      }
      lucide-icon {
        flex: 0 0 auto;
      }
    `,
  ],
  template: `@if (!readOnly) {
    <div class="v-card menu" role="menu">
      @for (item of items; track item.id) {
        <button type="button" role="menuitem" (click)="itemSelected.emit(item.id)">
          @if (item.icon) {
            <lucide-icon [name]="item.icon" [size]="17" aria-hidden="true" />
          }
          <span>{{ item.label }}</span>
        </button>
      }
    </div>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  @Input() items: readonly MenuItem[] = [];
  @Input() readOnly = true;
  @Output() readonly itemSelected = new EventEmitter<string>();
}

@Component({
  selector: 'verification-top-header',
  standalone: true,
  imports: [IconButtonComponent, UserAvatarComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .top {
        align-items: center;
        background: #fff;
        border: 1px solid var(--v-line);
        border-radius: 14px;
        display: flex;
        gap: 18px;
        padding: 12px 16px;
      }
      .brand {
        align-items: center;
        color: var(--v-green);
        display: flex;
        font-size: 22px;
        font-weight: 850;
        gap: 9px;
      }
      .logo {
        align-items: center;
        background: var(--v-green);
        border-radius: 7px;
        color: #fff;
        display: flex;
        height: 32px;
        justify-content: center;
        width: 36px;
      }
      .role {
        border-left: 1px solid var(--v-line);
        font-weight: 750;
        padding-left: 18px;
      }
      .spacer {
        flex: 1;
      }
      .date {
        border: 1px solid var(--v-line);
        border-radius: 9px;
        padding: 10px;
      }
      .user {
        align-items: center;
        display: flex;
        gap: 9px;
      }
      .user small {
        display: block;
        color: var(--v-muted);
      }
    `,
  ],
  template: `<header class="top">
    <div class="brand"><span class="logo">✓</span>MisVales</div>
    <div class="role">◆ &nbsp;{{ role }}</div>
    <span class="spacer"></span
    ><verification-icon-button ariaLabel="Ayuda" icon="?" /><verification-icon-button
      ariaLabel="Notificaciones"
      icon="♧"
      [badge]="notifications"
    /><span class="date">▣ &nbsp;{{ date }}</span>
    <div class="user">
      <verification-user-avatar [initials]="initials" [name]="userName" />
      <div>
        <strong>{{ userName }}</strong
        ><small>{{ role }}</small>
      </div>
    </div>
  </header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopHeaderComponent {
  @Input() role = 'Verificador';
  @Input() notifications = 3;
  @Input() date = '21 de mayo de 2025';
  @Input() initials = 'CR';
  @Input() userName = 'Carlos Ramírez';
}
