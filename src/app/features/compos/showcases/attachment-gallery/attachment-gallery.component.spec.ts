import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentGalleryComponent } from './attachment-gallery.component';

vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: {
    loadAnimation: () => ({
      destroy: vi.fn(),
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      play: vi.fn(),
    }),
  },
}));

describe('AttachmentGalleryComponent', () => {
  it('renders files in read-only mode without mutation controls', async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentGalleryComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttachmentGalleryComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-animation-asset="pdf.json"]')).not.toBeNull();
    expect(element.querySelector('[data-animation-asset="excel.json"]')).not.toBeNull();
    expect(element.querySelector('[data-animation-asset="img.json"]')).not.toBeNull();
    expect(element.querySelector('[data-animation-asset="mirar.json"]')).not.toBeNull();
    expect(element.querySelector('[aria-label^="Eliminar"]')).toBeNull();
    expect(element.querySelector('[aria-label^="Descargar"]')).toBeNull();
    expect(element.textContent).not.toContain('Seleccionar archivo');
    expect(element.textContent).not.toContain('Eliminar seleccionados');
    expect(element.textContent).not.toContain('Reintentar');
    expect(element.textContent).not.toContain('.docx');
    expect(element.querySelectorAll('.thumbnail .facade-image')).toHaveLength(8);
    expect(element.textContent).not.toContain('Laboratorio de interfaz');
    expect(element.querySelector('.modal-backdrop')).toBeNull();

    (element.querySelector('.thumbnail') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.modal-backdrop')).not.toBeNull();
    const previewImage = element.querySelector('.hero-preview img') as HTMLImageElement;
    expect(previewImage).not.toBeNull();
    expect(previewImage.src).toContain('interior.webp');
    expect(previewImage.alt).toBe('fachada_01.webp');
    expect(element.textContent).not.toContain('Descargar');

    (element.querySelector('.modal-close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.modal-backdrop')).toBeNull();
  });
});
