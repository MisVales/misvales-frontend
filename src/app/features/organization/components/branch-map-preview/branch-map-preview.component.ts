import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { Map, Marker, StyleSpecification } from 'maplibre-gl';

const OPEN_STREET_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    openStreetMap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [{ id: 'openStreetMap', type: 'raster', source: 'openStreetMap' }],
};

@Component({
  selector: 'app-branch-map-preview',
  standalone: true,
  template: `
    @if (hasCoordinates) {
      <div #mapContainer class="map" [attr.aria-label]="'Mapa de ' + label"></div>
    } @else {
      <div class="map map--empty" role="img" [attr.aria-label]="'Ubicación pendiente de ' + label">
        <span class="map--empty__grid" aria-hidden="true"></span>
        <span class="map--empty__message">Ubicación pendiente</span>
      </div>
    }
  `,
  styleUrl: './branch-map-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchMapPreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number | null | undefined;
  @Input() longitude: number | null | undefined;
  @Input() label = 'Sucursal';

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map?: Map;
  private marker?: Marker;
  private observer?: IntersectionObserver;
  private viewReady = false;

  get hasCoordinates(): boolean {
    return Number.isFinite(this.latitude) && Number.isFinite(this.longitude);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.observeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady || (!changes['latitude'] && !changes['longitude'])) return;
    if (!this.hasCoordinates) {
      this.destroyMap();
      return;
    }
    if (this.map) this.updatePosition();
    else queueMicrotask(() => this.observeMap());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroyMap();
  }

  private observeMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container || !this.hasCoordinates || this.map) return;

    if (typeof IntersectionObserver === 'undefined') {
      this.initializeMap(container);
      return;
    }

    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer?.disconnect();
        this.initializeMap(container);
      },
      { rootMargin: '160px' },
    );
    this.observer.observe(container);
  }

  private initializeMap(container: HTMLDivElement): void {
    if (this.map || !this.hasCoordinates) return;
    this.map = new Map({
      container,
      style: OPEN_STREET_MAP_STYLE,
      center: [this.longitude!, this.latitude!],
      zoom: 13.5,
      attributionControl: false,
      interactive: false,
      fadeDuration: 0,
    });
    this.marker = new Marker({ color: '#0f8b4c' })
      .setLngLat([this.longitude!, this.latitude!])
      .addTo(this.map);
  }

  private updatePosition(): void {
    if (!this.map || !this.marker || !this.hasCoordinates) return;
    const position: [number, number] = [this.longitude!, this.latitude!];
    this.map.setCenter(position);
    this.marker.setLngLat(position);
  }

  private destroyMap(): void {
    this.marker?.remove();
    this.marker = undefined;
    this.map?.remove();
    this.map = undefined;
  }
}
