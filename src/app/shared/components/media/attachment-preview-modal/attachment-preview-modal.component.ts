import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { AttachmentAnimationComponent } from '../attachment-animation/attachment-animation.component';

@Component({
  selector: 'refactor-attachment-preview-modal',
  standalone: true,
  imports: [AttachmentAnimationComponent],
  templateUrl: './attachment-preview-modal.component.html',
  styleUrl: './attachment-preview-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreviewModalComponent implements OnChanges {
  @Input({ required: true }) imageUrl = '';
  @Input({ required: true }) imageName = '';
  @Input({ required: true }) imageSize = '';
  @Input() imageType = 'Imagen';
  @Input() imageIndex = 0;
  @Input() totalImages = 0;
  @Input() readOnly = true;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly previous = new EventEmitter<void>();
  @Output() readonly next = new EventEmitter<void>();
  readonly zoom = signal(100);
  readonly panX = signal(0);
  readonly panY = signal(0);
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private areaWidth = 0;
  private areaHeight = 0;

  constructor() {
    document.body.style.overflow = 'hidden';
  }

  ngOnChanges(): void {
    this.zoom.set(100);
    this.resetPan();
  }

  @HostListener('window:keydown.escape') onEscape(): void {
    this.close();
  }

  close(): void {
    document.body.style.overflow = '';
    this.closed.emit();
  }

  zoomOut(): void {
    this.zoom.update((value) => Math.max(100, value - 10));
    this.clampPan();
  }
  zoomIn(): void {
    this.zoom.update((value) => Math.min(200, value + 10));
  }
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const area = event.currentTarget as HTMLElement;
    this.areaWidth = area.clientWidth;
    this.areaHeight = area.clientHeight;
    this.zoom.update((value) =>
      Math.min(200, Math.max(100, value + (event.deltaY < 0 ? 10 : -10))),
    );
    this.clampPan();
  }
  onPointerDown(event: PointerEvent): void {
    if (this.zoom() <= 100) return;
    const area = event.currentTarget as HTMLElement;
    this.areaWidth = area.clientWidth;
    this.areaHeight = area.clientHeight;
    this.dragging = true;
    this.dragStartX = event.clientX - this.panX();
    this.dragStartY = event.clientY - this.panY();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const area = event.currentTarget as HTMLElement;
    this.areaWidth = area.clientWidth;
    this.areaHeight = area.clientHeight;
    const factor = this.zoom() / 100 - 1;
    const maxX = (area.clientWidth * factor) / 2;
    const maxY = (area.clientHeight * factor) / 2;
    this.panX.set(Math.max(-maxX, Math.min(maxX, event.clientX - this.dragStartX)));
    this.panY.set(Math.max(-maxY, Math.min(maxY, event.clientY - this.dragStartY)));
  }
  onPointerUp(): void {
    this.dragging = false;
  }
  private resetPan(): void {
    this.panX.set(0);
    this.panY.set(0);
  }
  private clampPan(): void {
    if (!this.areaWidth || !this.areaHeight) return;
    const factor = this.zoom() / 100 - 1;
    const maxX = (this.areaWidth * factor) / 2;
    const maxY = (this.areaHeight * factor) / 2;
    this.panX.update((value) => Math.max(-maxX, Math.min(maxX, value)));
    this.panY.update((value) => Math.max(-maxY, Math.min(maxY, value)));
  }
}
