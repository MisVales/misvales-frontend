import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  AttachmentAnimationComponent,
  AttachmentAnimationType,
} from '@shared/components/media/attachment-animation/attachment-animation.component';
import { AttachmentPreviewModalComponent } from '@shared/components/media/attachment-preview-modal/attachment-preview-modal.component';
import { StatusBadgeComponent } from '@shared/components/badges/semantic-status-badge/status-badge.component';

interface GalleryFile {
  readonly name: string;
  readonly meta: string;
  readonly kind: AttachmentAnimationType;
}

interface GalleryImage {
  readonly name: string;
  readonly size: string;
  readonly url: string;
}

const SAMPLE_IMAGE_URL = new URL('../interior.webp', import.meta.url).toString();

@Component({
  selector: 'refactor-attachment-gallery',
  standalone: true,
  imports: [AttachmentAnimationComponent, AttachmentPreviewModalComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attachment-gallery.component.html',
  styleUrl: './attachment-gallery.component.css',
})
export class AttachmentGalleryComponent implements OnInit, OnDestroy {
  @Input() readOnly = true;
  protected readonly dragging = signal(false);
  protected readonly uploadProgress = signal(40);
  protected readonly dropzoneHovered = signal(false);
  protected readonly hoveredFile = signal<string | null>(null);
  protected readonly hoveredImage = signal<string | null>(null);
  protected readonly activeTab = signal<'images' | 'documents'>('images');
  protected readonly selectedImage = signal(0);
  protected readonly modalOpen = signal(false);
  protected readonly files = signal<readonly GalleryFile[]>([
    { name: 'comprobante_2026.pdf', meta: '12 MB · PDF', kind: 'pdf' },
    { name: 'factura_agosto.jpg', meta: '2.4 MB · JPG', kind: 'image' },
    { name: 'sello_autorizado.png', meta: '512 KB · PNG', kind: 'image' },
    { name: 'detalle_operaciones.xlsx', meta: '1.1 MB · XLSX', kind: 'excel' },
  ]);
  protected readonly images = signal<readonly GalleryImage[]>([
    { name: 'fachada_01.webp', size: '1.2 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_02.webp', size: '1.1 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_03.webp', size: '2.3 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_04.webp', size: '1.1 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_05.webp', size: '1.7 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_06.webp', size: '1.6 MB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_07.webp', size: '963 KB', url: SAMPLE_IMAGE_URL },
    { name: 'fachada_08.webp', size: '1.3 MB', url: SAMPLE_IMAGE_URL },
  ]);

  private uploadTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.readOnly) return;
    this.uploadTimer = setInterval(() => {
      this.uploadProgress.update((progress) => {
        const next = Math.min(progress + 2, 100);
        if (next === 100 && this.uploadTimer) {
          clearInterval(this.uploadTimer);
          this.uploadTimer = undefined;
        }
        return next;
      });
    }, 120);
  }

  protected selectTab(tab: 'images' | 'documents'): void {
    this.activeTab.set(tab);
  }

  protected uploadedMegabytes(): string {
    return ((8 * this.uploadProgress()) / 100).toFixed(1);
  }

  protected openPreview(index: number): void {
    this.selectedImage.set(index);
    this.modalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closePreview(): void {
    this.modalOpen.set(false);
    document.body.style.overflow = '';
  }

  protected previousImage(): void {
    this.selectedImage.update((index) => (index - 1 + this.images().length) % this.images().length);
  }

  protected nextImage(): void {
    this.selectedImage.update((index) => (index + 1) % this.images().length);
  }

  protected removeFile(index: number): void {
    if (this.readOnly) return;
    this.files.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  ngOnDestroy(): void {
    if (this.uploadTimer) clearInterval(this.uploadTimer);
    document.body.style.overflow = '';
  }
}
