import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web/build/player/lottie_light';

export type AttachmentAnimationType =
  | 'upload'
  | 'loading'
  | 'pdf'
  | 'excel'
  | 'image'
  | 'download'
  | 'delete'
  | 'view'
  | 'clock'
  | 'folder';

interface LottieDocument {
  readonly v: string;
  readonly fr: number;
  readonly ip: number;
  readonly op: number;
  readonly w: number;
  readonly h: number;
  readonly layers: readonly unknown[];
}

const ANIMATION_ASSETS: Readonly<Record<AttachmentAnimationType, string>> = {
  upload: '/iconos/upload.json',
  loading: '/iconos/loading.json',
  pdf: '/iconos/pdf.json',
  excel: '/iconos/excel.json',
  image: '/iconos/img.json',
  download: '/iconos/descargar.json',
  delete: '/iconos/delete.json',
  view: '/iconos/mirar.json',
  clock: '/iconos/reloj.json',
  folder: '/iconos/carpeta.json',
};

const animationCache = new Map<AttachmentAnimationType, Promise<LottieDocument>>();
let lottiePlayerPromise: Promise<typeof import('lottie-web/build/player/lottie_light')> | undefined;

function loadLottiePlayer(): Promise<typeof import('lottie-web/build/player/lottie_light')> {
  lottiePlayerPromise ??= import('lottie-web/build/player/lottie_light');
  return lottiePlayerPromise;
}

function isLottieDocument(value: unknown): value is LottieDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LottieDocument>;
  return (
    typeof candidate.v === 'string' &&
    typeof candidate.fr === 'number' &&
    typeof candidate.ip === 'number' &&
    typeof candidate.op === 'number' &&
    typeof candidate.w === 'number' &&
    typeof candidate.h === 'number' &&
    Array.isArray(candidate.layers)
  );
}

function loadAnimation(type: AttachmentAnimationType): Promise<LottieDocument> {
  const cached = animationCache.get(type);
  if (cached) return cached;

  const request = fetch(ANIMATION_ASSETS[type], { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`No fue posible cargar la animación ${type}.`);
      return response.json() as Promise<unknown>;
    })
    .then((data) => {
      if (!isLottieDocument(data)) throw new Error(`El recurso ${type} no es un Lottie válido.`);
      return data;
    })
    .catch((error: unknown) => {
      animationCache.delete(type);
      throw error;
    });

  animationCache.set(type, request);
  return request;
}

@Component({
  selector: 'refactor-attachment-animation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--animation-size.px]': 'size',
    '[style.--animation-scale]': 'scale',
    '[class.lottie-transparent-background]': 'transparentBackground',
    '[attr.data-animation-type]': 'type',
    '[attr.data-animation-asset]': 'assetName',
    '[attr.data-animation-ready]': 'loadState() === "ready"',
    '[attr.aria-hidden]': 'decorative ? "true" : null',
    '[attr.role]': 'decorative ? null : "img"',
    '[attr.aria-label]': 'decorative ? null : accessibleLabel',
  },
  templateUrl: './attachment-animation.component.html',
  styleUrl: './attachment-animation.component.css',
})
export class AttachmentAnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) type!: AttachmentAnimationType;
  @Input() size = 40;
  @Input() scale = 1;
  @Input() transparentBackground = false;
  @Input()
  set playing(value: boolean) {
    this.externallyPlaying = value;
    if (value) this.startHoverAnimation();
    else this.stopHoverAnimation();
  }
  @Input() decorative = true;
  @Input() accessibleLabel = '';

  @ViewChild('animationContainer') private animationContainer?: ElementRef<HTMLDivElement>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyed = false;
  private observer?: IntersectionObserver;
  private animation?: AnimationItem;
  private document?: LottieDocument;
  private externallyPlaying = false;
  protected readonly loadState = signal<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  protected readonly reducedMotion = signal(false);

  protected get assetName(): string {
    if (this.type === 'image') return 'img.json';
    if (this.type === 'download') return 'descargar.json';
    if (this.type === 'view') return 'mirar.json';
    if (this.type === 'clock') return 'reloj.json';
    if (this.type === 'folder') return 'carpeta.json';
    return `${this.type}.json`;
  }

  ngOnInit(): void {
    this.reducedMotion.set(
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    );

    if (!('IntersectionObserver' in window)) {
      void this.prepareAnimation();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.observer?.disconnect();
          void this.prepareAnimation();
        }
      },
      { rootMargin: '80px' },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngAfterViewInit(): void {
    this.renderAnimation();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroyed = true;
    this.animation?.destroy();
    this.animation = undefined;
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  protected play(): void {
    this.startHoverAnimation();
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  protected reset(): void {
    if (!this.externallyPlaying) this.stopHoverAnimation();
  }

  private async prepareAnimation(): Promise<void> {
    this.loadState.set('loading');
    try {
      this.document = await loadAnimation(this.type);
      if (this.destroyed) return;
      this.renderAnimation();
    } catch {
      if (!this.destroyed) this.loadState.set('fallback');
    }
  }

  private async renderAnimation(): Promise<void> {
    if (!this.document || !this.animationContainer || this.animation) return;

    const container = this.animationContainer.nativeElement;
    try {
      const module = await loadLottiePlayer();
      if (this.destroyed || this.animation || !this.document) return;
      this.animation = module.default.loadAnimation({
        container,
        renderer: 'svg',
        loop: this.type === 'loading',
        autoplay: this.type === 'loading' && !this.reducedMotion(),
        animationData: this.document,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
      });
    } catch {
      if (!this.destroyed) this.loadState.set('fallback');
      return;
    }
    this.animation.goToAndStop(0, true);
    const svg = container.querySelector('svg') as SVGSVGElement | null;
    if (svg && this.scale !== 1) {
      svg.style.transform = `scale(${this.scale})`;
      svg.style.transformOrigin = 'center';
    }
    if (this.transparentBackground) {
      const backgroundLayer = container.querySelector(
        'svg > g[clip-path] > g:first-child',
      ) as SVGGElement | null;
      if (backgroundLayer) backgroundLayer.style.display = 'none';
    }
    if (this.type === 'loading' && !this.reducedMotion()) this.animation.play();
    if (this.externallyPlaying) this.startHoverAnimation();
    this.loadState.set('ready');
  }

  private startHoverAnimation(): void {
    if (this.reducedMotion() || this.type === 'loading') return;
    if (this.animation) {
      this.animation.loop = true;
      this.animation.goToAndPlay(0, true);
    }
  }

  private stopHoverAnimation(): void {
    if (this.type !== 'loading' && this.animation) {
      this.animation.loop = false;
      this.animation.goToAndStop(0, true);
    }
  }
}
