import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { AttachmentAnimationComponent } from '@shared/components/media/attachment-animation/attachment-animation.component';
import { AttachmentPreviewModalComponent } from '@shared/components/media/attachment-preview-modal/attachment-preview-modal.component';
import { EvidenceItem } from '../../models/verification.models';
import { VerificationStatusBadgeComponent } from '../primitives/verification-primitives';
const SHARED = '../../styles/verification-tokens.css';

@Component({
  selector: 'verification-evidence-card',
  standalone: true,
  imports: [AttachmentAnimationComponent, VerificationStatusBadgeComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .evidence {
        background: #fff;
        border: 1px solid var(--v-line);
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        min-height: 190px;
        overflow: hidden;
        text-align: left;
        width: 100%;
      }
      .head {
        align-items: flex-start;
        display: flex;
        gap: 8px;
        justify-content: space-between;
        padding: 10px;
      }
      .head strong {
        font-size: 11px;
      }
      .preview {
        align-items: center;
        background: #eef1f2;
        display: flex;
        height: 112px;
        justify-content: center;
        overflow: hidden;
      }
      .image-preview {
        background-color: #eef1f2;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        height: 100%;
        width: 100%;
      }
      .meta {
        padding: 8px 10px;
      }
      .meta strong {
        display: block;
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .meta span {
        color: var(--v-muted);
        font-size: 10px;
      }
    `,
  ],
  template: `<button class="evidence" type="button" (click)="opened.emit(item)">
    <span class="head"
      ><strong>{{ item.title }}</strong>
      @if (item.status) {
        <verification-status-badge [status]="item.status" />
      }</span
    ><span class="preview">
      @if (item.kind === 'image') {
        <span
          class="image-preview"
          role="img"
          [attr.aria-label]="item.title"
          [style.background-image]="item.imageUrl ? 'url(' + item.imageUrl + ')' : null"
        ></span>
      } @else {
        <refactor-attachment-animation
          [type]="item.kind"
          [size]="72"
          [transparentBackground]="item.kind === 'pdf'"
        />
      }</span
    ><span class="meta"
      ><strong>{{ item.fileName }}</strong
      ><span>{{ item.size }}</span></span
    >
  </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationEvidenceCardComponent {
  @Input({ required: true }) item!: EvidenceItem;
  @Output() readonly opened = new EventEmitter<EvidenceItem>();
}

@Component({
  selector: 'verification-evidence-dropzone',
  standalone: true,
  imports: [AttachmentAnimationComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .drop {
        align-items: center;
        background: #f7fcf9;
        border: 1.5px dashed var(--v-green);
        border-radius: 11px;
        color: var(--v-green);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 190px;
        padding: 15px;
        text-align: center;
      }
      .drop strong {
        font-size: 12px;
      }
      .drop span {
        color: var(--v-muted);
        font-size: 10px;
        line-height: 1.5;
      }
      .active {
        background: #eaf8ef;
      }
    `,
  ],
  template: `@if (!readOnly) {
    <button
      class="drop"
      [class.active]="dragging()"
      type="button"
      (mouseenter)="hovered.set(true)"
      (mouseleave)="hovered.set(false)"
      (dragenter)="$event.preventDefault(); dragging.set(true)"
      (dragover)="$event.preventDefault()"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
      (click)="selected.emit()"
    >
      <refactor-attachment-animation
        type="upload"
        [size]="58"
        [playing]="hovered() || dragging()"
      /><strong>Subir evidencia</strong
      ><span>Arrastra y suelta archivos aquí<br />JPG, PNG, WebP o PDF · Máx. 10 MB</span>
    </button>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationEvidenceDropzoneComponent {
  @Input() readOnly = true;
  readonly dragging = signal(false);
  readonly hovered = signal(false);
  @Output() readonly selected = new EventEmitter<void>();
  @Output() readonly filesDropped = new EventEmitter<readonly File[]>();
  protected onDrop(event: DragEvent): void {
    if (this.readOnly) return;
    event.preventDefault();
    this.dragging.set(false);
    this.filesDropped.emit(Array.from(event.dataTransfer?.files ?? []));
  }
}

@Component({
  selector: 'verification-evidence-gallery',
  standalone: true,
  imports: [
    VerificationEvidenceCardComponent,
    VerificationEvidenceDropzoneComponent,
    AttachmentPreviewModalComponent,
  ],
  styleUrls: [SHARED],
  styles: [
    `
      .gallery {
        padding: 18px;
      }
      .gallery h3 {
        margin: 0;
      }
      .gallery > p {
        color: var(--v-muted);
        font-size: 11px;
        margin: 5px 0 14px;
      }
      .grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
      }
    `,
  ],
  template: `<section class="v-card gallery">
      <h3>{{ title }}</h3>
      @if (subtitle) {
        <p>{{ subtitle }}</p>
      }
      <div class="grid">
        @for (item of items; track item.fileName) {
          <verification-evidence-card [item]="item" (opened)="open(item)" />
        }
        @if (showDropzone && !readOnly) {
          <verification-evidence-dropzone
            (selected)="uploadRequested.emit()"
            (filesDropped)="filesDropped.emit($event)"
          />
        }
      </div>
    </section>
    @if (previewIndex() !== null) {
      <refactor-attachment-preview-modal
        [imageUrl]="items[previewIndex()!].imageUrl!"
        [imageName]="items[previewIndex()!].fileName"
        [imageSize]="items[previewIndex()!].size"
        [imageIndex]="previewIndex()!"
        [totalImages]="imageItems.length"
        [readOnly]="readOnly"
        (closed)="previewIndex.set(null)"
        (previous)="move(-1)"
        (next)="move(1)"
      />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationEvidenceGalleryComponent {
  @Input() title = 'Evidencias';
  @Input() subtitle = '';
  @Input() items: readonly EvidenceItem[] = [];
  @Input() showDropzone = false;
  @Input() readOnly = true;
  @Output() readonly uploadRequested = new EventEmitter<void>();
  @Output() readonly filesDropped = new EventEmitter<readonly File[]>();
  readonly previewIndex = signal<number | null>(null);
  get imageItems(): readonly EvidenceItem[] {
    return this.items.filter((i) => i.kind === 'image');
  }
  protected open(item: EvidenceItem): void {
    if (item.kind !== 'image' || !item.imageUrl) return;
    this.previewIndex.set(this.items.indexOf(item));
  }
  protected move(delta: number): void {
    const current = this.previewIndex();
    if (current === null) return;
    const imageIndices = this.items
      .map((item, index) => (item.kind === 'image' ? index : -1))
      .filter((index) => index >= 0);
    const position = imageIndices.indexOf(current);
    this.previewIndex.set(
      imageIndices[(position + delta + imageIndices.length) % imageIndices.length],
    );
  }
}
