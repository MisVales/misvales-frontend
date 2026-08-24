import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AttachmentGalleryComponent } from './showcases/attachment-gallery/attachment-gallery.component';
import { ExecutiveGalleryComponent } from './showcases/executive/executive-gallery.component';
import { VerificationGalleryComponent } from './showcases/verification/verification-gallery.component';

interface CatalogGroup {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly description: string;
  readonly count: number;
}

@Component({
  selector: 'app-compos-catalog',
  standalone: true,
  imports: [AttachmentGalleryComponent, VerificationGalleryComponent, ExecutiveGalleryComponent],
  templateUrl: './compos-catalog.component.html',
  styleUrl: './compos-catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposCatalogComponent {
  protected readonly totalComponents = 55;
  protected readonly recoveredFiles = 69;
  protected readonly groups: readonly CatalogGroup[] = [
    {
      id: 'archivos',
      index: '01',
      title: 'Archivos y evidencias',
      description: 'Carga, progreso, formatos, estados y vista previa en modo seguro.',
      count: 4,
    },
    {
      id: 'verificador',
      index: '02',
      title: 'Experiencia de verificación',
      description: 'Primitivas, datos, tablas, ubicación, flujo, decisiones y evidencias.',
      count: 40,
    },
    {
      id: 'gerencia',
      index: '03',
      title: 'Vista ejecutiva',
      description: 'Navegación, métricas, alertas, configuración y salud operativa.',
      count: 11,
    },
  ];
}
