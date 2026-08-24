import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const ICON_ASSETS: Readonly<Record<string, string>> = {
  'car.png': '/iconos/car.png',
  'icons8-bandera-2.svg': '/iconos/icons8-bandera-2.svg',
  'icons8-bienes.svg': '/iconos/icons8-bienes.svg',
  'icons8-cuenta-comercial.svg': '/iconos/icons8-cuenta-comercial.svg',
  'icons8-documento.svg': '/iconos/icons8-documento.svg',
  'icons8-google-maps-nuevo.svg': '/iconos/icons8-google-maps-nuevo.svg',
  'icons8-negocio.svg': '/iconos/icons8-negocio.svg',
  'icons8-nombre.svg': '/iconos/icons8-nombre.svg',
  'icons8-robo-de-identidad.svg': '/iconos/icons8-robo-de-identidad.svg',
  'icons8-telefono.svg': '/iconos/icons8-telefono.svg',
  'vehicle.svg': '/iconos/vehicle.svg',
};

@Component({
  selector: 'verification-asset-icon',
  standalone: true,
  template: `<img
    [src]="source"
    [alt]="decorative ? '' : alt"
    [attr.aria-hidden]="decorative ? 'true' : null"
    [style.width.px]="size"
    [style.height.px]="size"
  />`,
  styles: [
    `
      :host {
        align-items: center;
        display: inline-flex;
        flex: 0 0 auto;
        justify-content: center;
      }
      img {
        display: block;
        object-fit: contain;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationAssetIconComponent {
  @Input({ required: true }) fileName = '';
  @Input() alt = '';
  @Input() size = 28;
  @Input() decorative = true;

  protected get source(): string {
    return ICON_ASSETS[this.fileName] ?? '';
  }
}

@Component({
  selector: 'verification-context-tile',
  standalone: true,
  imports: [VerificationAssetIconComponent],
  template: `<article class="context-tile">
    <span class="icon-wrap">
      <verification-asset-icon [fileName]="icon" [size]="32" />
    </span>
    <span
      ><small>{{ label }}</small
      ><strong>{{ value }}</strong></span
    >
  </article>`,
  styleUrls: ['../../styles/verification-tokens.css'],
  styles: [
    `
      .context-tile {
        align-items: center;
        background: #fbfcfc;
        border: 1px solid var(--v-line);
        border-radius: 12px;
        display: grid;
        gap: 12px;
        grid-template-columns: 48px minmax(0, 1fr);
        min-height: 78px;
        padding: 12px;
      }
      .icon-wrap {
        align-items: center;
        background: var(--v-green-soft);
        border-radius: 11px;
        display: flex;
        height: 48px;
        justify-content: center;
      }
      small,
      strong {
        display: block;
      }
      small {
        color: var(--v-muted);
        font-size: 10px;
        margin-bottom: 4px;
      }
      strong {
        font-size: 12px;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationContextTileComponent {
  @Input({ required: true }) icon = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
}
