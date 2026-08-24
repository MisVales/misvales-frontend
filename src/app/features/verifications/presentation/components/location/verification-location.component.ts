import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { Map, Marker, NavigationControl, StyleSpecification } from 'maplibre-gl';
import { VerificationAssetIconComponent } from '../primitives/verification-asset-icon.component';

const OPEN_STREET_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    openStreetMap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'openStreetMap', type: 'raster', source: 'openStreetMap' }],
};

@Component({
  selector: 'verification-location',
  standalone: true,
  imports: [VerificationAssetIconComponent],
  templateUrl: './verification-location.component.html',
  styleUrls: ['../../styles/verification-tokens.css', './verification-location.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationLocationComponent implements OnDestroy {
  @Input({ required: true }) address = '';
  @Input() placeName = 'Ubicación de la visita';
  @Input() latitude = 25.532861;
  @Input() longitude = -103.322991;

  protected readonly modalOpen = signal(false);
  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map?: Map;

  protected open(): void {
    this.modalOpen.set(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.initializeMap());
  }

  protected close(): void {
    this.map?.remove();
    this.map = undefined;
    this.modalOpen.set(false);
    document.body.style.overflow = '';
  }

  protected googleMapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.latitude},${this.longitude}`;
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    if (this.modalOpen()) this.close();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    document.body.style.overflow = '';
  }

  private initializeMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container || this.map) return;

    this.map = new Map({
      container,
      style: OPEN_STREET_MAP_STYLE,
      center: [this.longitude, this.latitude],
      zoom: 15,
      attributionControl: {},
    });
    this.map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    new Marker({ color: '#08783f' }).setLngLat([this.longitude, this.latitude]).addTo(this.map);
  }
}
