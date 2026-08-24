import { TestBed } from '@angular/core/testing';
import {
  ChevronDown,
  CircleCheck,
  Circle,
  ClipboardList,
  Clock,
  FileCheck,
  FileText,
  Info,
  Link,
  ListFilter,
  LucideAngularModule,
  MapPin,
  Phone,
  ReceiptText,
  ScanSearch,
  Search,
  Smartphone,
  Store,
  X,
} from 'lucide-angular';
import { vi } from 'vitest';
import { VerificationGalleryComponent } from './verification-gallery.component';

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

describe('VerificationGalleryComponent', () => {
  it('renders the isolated component catalog', async () => {
    await TestBed.configureTestingModule({
      imports: [
        VerificationGalleryComponent,
        LucideAngularModule.pick({
          ChevronDown,
          Circle,
          CircleCheck,
          ClipboardList,
          Clock,
          FileCheck,
          FileText,
          Info,
          Link,
          ListFilter,
          MapPin,
          Phone,
          ReceiptText,
          ScanSearch,
          Search,
          Smartphone,
          Store,
          X,
        }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VerificationGalleryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Galería de componentes');
    expect(fixture.nativeElement.textContent).toContain('Evidencias capturadas en la visita');
    expect(fixture.nativeElement.textContent).toContain(
      'Carretera Torreón Matamoros 9275, Torreón, Coahuila',
    );
    expect(
      fixture.nativeElement.querySelector('[data-animation-asset="reloj.json"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-animation-asset="carpeta.json"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('verification-context-tile img')).toHaveLength(9);
    expect(fixture.nativeElement.querySelector('.map-pin img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('verification-empty-state img')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Av. Insurgentes Sur 1234, Del Valle, Benito Juárez, CDMX',
    );
    expect(fixture.nativeElement.textContent).toContain('Ver mapa');
    expect(fixture.nativeElement.querySelector('refactor-attachment-preview-modal')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Guardar diferencia');
    expect(fixture.nativeElement.textContent).not.toContain('Guardar avance');
    expect(fixture.nativeElement.textContent).not.toContain('Subir evidencia');
    expect(fixture.nativeElement.querySelector('verification-action-footer footer')).toBeNull();

    const accordionButtons = Array.from(
      fixture.nativeElement.querySelectorAll('verification-accordion .trigger'),
    ) as HTMLButtonElement[];
    const personal = accordionButtons.find((button) =>
      button.textContent?.includes('Datos personales'),
    );
    const jobs = accordionButtons.find((button) => button.textContent?.includes('Empleos'));
    expect(personal).toBeDefined();
    expect(jobs).toBeDefined();

    personal?.click();
    fixture.detectChanges();
    expect(personal?.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Nombre completo');

    jobs?.click();
    fixture.detectChanges();
    expect(personal?.getAttribute('aria-expanded')).toBe('false');
    expect(jobs?.getAttribute('aria-expanded')).toBe('true');

    const filterTrigger = fixture.nativeElement.querySelector(
      '.toolbar verification-filter-button .select-trigger',
    ) as HTMLButtonElement;
    filterTrigger.click();
    fixture.detectChanges();
    const filterOptions = Array.from(
      fixture.nativeElement.querySelectorAll('.toolbar verification-filter-button .select-option'),
    ) as HTMLButtonElement[];
    expect(filterOptions).toHaveLength(11);
    expect(filterOptions.every((option) => option.dataset['optionTone'])).toBe(true);

    filterOptions.find((option) => option.textContent?.includes('Con diferencias'))?.click();
    fixture.detectChanges();
    const requestTable = fixture.nativeElement.querySelector('verification-request-table');
    expect(requestTable.textContent).toContain('Ana Belén Martínez');
    expect(requestTable.textContent).not.toContain('María González López');
  });
});
