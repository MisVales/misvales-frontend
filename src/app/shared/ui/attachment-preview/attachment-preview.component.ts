import { Component, Input, OnChanges, OnDestroy, SimpleChanges, HostListener, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-attachment-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Thumbnail Preview -->
    <div class="mt-3" *ngIf="displayUrl">
      <div 
        class="group relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0"
        [class.cursor-pointer]="isImage || isPdf"
        (click)="openModal()">
        
        <ng-container *ngIf="isImage; else nonImageTpl">
          <img [src]="safeDisplayUrl" class="w-full h-full object-cover" [alt]="fileName" />
        </ng-container>

        <ng-template #nonImageTpl>
          <div class="flex flex-col items-center justify-center h-full p-2 text-center" [class.text-red-500]="isPdf" [class.text-gray-500]="!isPdf">
            <svg *ngIf="isPdf" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            <svg *ngIf="!isPdf" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span class="text-[10px] font-semibold mt-1 truncate w-full" [title]="fileName">{{ isPdf ? 'PDF' : 'Archivo' }}</span>
          </div>
        </ng-template>

        <!-- Hover overlay -->
        <div *ngIf="isImage || isPdf" class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        </div>
      </div>
      <div *ngIf="fileName" class="text-xs text-gray-500 mt-1 truncate max-w-[96px]" [title]="fileName">{{ fileName }}</div>
    </div>

    <!-- Modal Lightbox -->
    <div *ngIf="isOpen()" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/90 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
      
      <!-- Content -->
      <div class="relative z-10 w-full max-w-[95vw] h-[95vh] flex flex-col pointer-events-none">
        
        <!-- Toolbar -->
        <div class="flex justify-between items-center p-4 text-white pointer-events-auto">
          <span class="text-sm font-medium truncate drop-shadow-md">{{ fileName || 'Vista Previa' }}</span>
          <button type="button" (click)="closeModal()" class="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Media Container -->
        <div class="flex-1 flex items-center justify-center overflow-hidden p-4 pointer-events-auto" (click)="closeModal()">
          <div class="relative max-w-full max-h-full" (click)="$event.stopPropagation()">
            <ng-container *ngIf="isImage">
              <img [src]="safeDisplayUrl" class="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" [alt]="fileName">
            </ng-container>
            <ng-container *ngIf="isPdf">
              <iframe [src]="safeDisplayUrl" class="w-[80vw] max-w-5xl h-[85vh] bg-white rounded shadow-2xl border-0" title="Vista Previa PDF"></iframe>
            </ng-container>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AttachmentPreviewComponent implements OnChanges, OnDestroy {
  @Input() file?: File;
  @Input() url?: string;
  @Input() fileName?: string;
  @Input() mimeType?: string;

  private sanitizer = inject(DomSanitizer);

  localUrl: string | null = null;
  isOpen = signal(false);

  get displayUrl(): string | null | undefined {
    return this.localUrl || this.url;
  }
  
  get safeDisplayUrl(): SafeResourceUrl | null {
    const url = this.displayUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  get isImage(): boolean {
    const type = this.getDerivedMimeType();
    return type.startsWith('image/');
  }

  get isPdf(): boolean {
    const type = this.getDerivedMimeType();
    return type === 'application/pdf';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['file']) {
      this.cleanupLocalUrl();
      if (this.file) {
        this.localUrl = URL.createObjectURL(this.file);
        if (!this.fileName) this.fileName = this.file.name;
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupLocalUrl();
  }

  private cleanupLocalUrl(): void {
    if (this.localUrl) {
      URL.revokeObjectURL(this.localUrl);
      this.localUrl = null;
    }
  }

  private getDerivedMimeType(): string {
    if (this.mimeType) return this.mimeType.toLowerCase();
    if (this.file?.type) return this.file.type.toLowerCase();
    
    const name = (this.fileName || this.url || '').toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.match(/\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)$/i)) return 'image/jpeg';
    
    return 'application/octet-stream';
  }

  openModal(): void {
    if (this.isImage || this.isPdf) {
      this.isOpen.set(true);
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.isOpen()) {
      this.closeModal();
    }
  }
}
