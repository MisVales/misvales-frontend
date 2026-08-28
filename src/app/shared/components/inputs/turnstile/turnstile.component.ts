import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurnstileService } from '@core/auth/turnstile/turnstile.service';
import { TurnstileSize, TurnstileTheme } from '@core/auth/turnstile/turnstile.types';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-turnstile',
  imports: [CommonModule],
  template: `
    @if (isEnabled) {
      <div class="turnstile-outer my-3 flex justify-center w-full min-h-[65px]">
        @if (isLocalDemo) {
          <button
            type="button"
            (click)="completeLocalDemo()"
            class="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {{
              localDemoCompleted()
                ? 'Verificación local completada'
                : 'Completar Turnstile local (demo)'
            }}
          </button>
        } @else {
          <div #turnstileContainer class="turnstile-container"></div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .turnstile-outer {
        contain: layout;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnstileComponent implements OnDestroy {
  private readonly turnstileService = inject(TurnstileService);

  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('turnstileContainer');

  @Input() theme: TurnstileTheme = 'auto';
  @Input() size: TurnstileSize = 'normal';
  @Input() language = 'es';
  @Input() action?: string;
  @Input() cData?: string;

  @Output() tokenChange = new EventEmitter<string | null>();
  @Output() error = new EventEmitter<string>();
  @Output() expired = new EventEmitter<void>();
  @Output() timeout = new EventEmitter<void>();

  readonly isLoaded = signal(false);
  readonly localDemoCompleted = signal(false);
  readonly isLocalDemo = environment.turnstileLocalDemo;
  private widgetId: string | null = null;
  private isDestroyed = false;

  get isEnabled(): boolean {
    return this.turnstileService.isEnabled;
  }

  constructor() {
    effect(() => {
      const container = this.containerRef()?.nativeElement;
      const enabled = this.isEnabled;
      if (enabled && !this.isLocalDemo && container && !this.widgetId && !this.isDestroyed) {
        untracked(() => {
          void this.renderWidget(container);
        });
      }
    });
  }

  async renderWidget(containerEl?: HTMLElement): Promise<void> {
    if (!this.isEnabled || this.isLocalDemo || this.isDestroyed) return;

    try {
      const container = containerEl ?? this.containerRef()?.nativeElement;
      if (!container) return;

      container.innerHTML = '';

      this.widgetId = await this.turnstileService.render(container, {
        sitekey: this.turnstileService.siteKey,
        theme: this.theme,
        size: this.size,
        language: this.language,
        action: this.action,
        cData: this.cData,
        callback: (token: string) => {
          if (!this.isDestroyed) {
            this.tokenChange.emit(token);
          }
        },
        'error-callback': (errorCode: string) => {
          if (!this.isDestroyed) {
            this.tokenChange.emit(null);
            this.error.emit(errorCode);
          }
        },
        'expired-callback': () => {
          if (!this.isDestroyed) {
            this.tokenChange.emit(null);
            this.expired.emit();
          }
        },
        'timeout-callback': () => {
          if (!this.isDestroyed) {
            this.tokenChange.emit(null);
            this.timeout.emit();
          }
        },
      });

      this.isLoaded.set(true);
    } catch (err) {
      if (!this.isDestroyed) {
        this.tokenChange.emit(null);
        this.error.emit(err instanceof Error ? err.message : 'TURNSTILE_INIT_ERROR');
      }
    }
  }

  reset(): void {
    if (this.isLocalDemo) {
      this.localDemoCompleted.set(false);
      this.tokenChange.emit(null);
      return;
    }
    if (this.widgetId) {
      this.turnstileService.reset(this.widgetId);
      this.tokenChange.emit(null);
    }
  }

  completeLocalDemo(): void {
    this.localDemoCompleted.set(true);
    this.tokenChange.emit('local-demo-turnstile');
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.widgetId) {
      this.turnstileService.remove(this.widgetId);
      this.widgetId = null;
    }
  }
}
