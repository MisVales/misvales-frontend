import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { RefactorInputComponent } from '@shared/components/inputs/refactor-input/refactor-input.component';
import {
  RefactorSelectComponent,
  RefactorSelectOption,
} from '@shared/components/inputs/refactor-select/refactor-select.component';
import {
  DetailItem,
  RequestItem,
  TableColumn,
  VerificationStatus,
} from '../../models/verification.models';
import {
  AppButtonComponent,
  EmptyStateComponent,
  VerificationStatusBadgeComponent,
} from '../primitives/verification-primitives';
import { VerificationLocationComponent } from '../location/verification-location.component';
const SHARED = '../../styles/verification-tokens.css';

@Component({
  selector: 'verification-detail-grid',
  standalone: true,
  imports: [CommonModule],
  styleUrls: [SHARED],
  styles: [
    `
      .details {
        display: grid;
        gap: 10px 24px;
      }
      .two {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .item {
        display: grid;
        gap: 8px;
        grid-template-columns: minmax(105px, 0.7fr) 1.3fr;
      }
      .item dt {
        font-size: 11px;
        font-weight: 750;
      }
      .item dd {
        font-size: 11px;
        margin: 0;
        overflow-wrap: anywhere;
      }
      @media (max-width: 650px) {
        .two {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `<dl class="details" [class.two]="columns === 2">
    @for (item of items; track item.label) {
      <div class="item">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    }
  </dl>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailGridComponent {
  @Input() items: readonly DetailItem[] = [];
  @Input() columns: 1 | 2 = 2;
}

@Component({
  selector: 'verification-data-table',
  standalone: true,
  imports: [EmptyStateComponent],
  styleUrls: [SHARED],
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
        min-width: 0;
      }
      .scroll {
        max-width: 100%;
        overflow: auto;
        overscroll-behavior-inline: contain;
      }
      table {
        border-collapse: collapse;
        font-size: 11px;
        min-width: 520px;
        width: 100%;
      }
      th,
      td {
        border-bottom: 1px solid #e8ecee;
        padding: 9px;
        text-align: left;
      }
      th {
        background: #fafbfb;
        font-size: 10px;
      }
      tbody tr:hover {
        background: #f7fbf9;
      }
    `,
  ],
  template: `@if (rows.length) {
      <div class="scroll">
        <table>
          <thead>
            <tr>
              @for (column of columns; track column.key) {
                <th [style.width]="column.width">{{ column.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track $index) {
              <tr>
                @for (column of columns; track column.key) {
                  <td>{{ row[column.key] }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <verification-empty-state [description]="emptyMessage" />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadOnlyDataTableComponent {
  @Input() columns: readonly TableColumn[] = [];
  @Input() rows: readonly Record<string, string | number>[] = [];
  @Input() emptyMessage = 'No hay registros.';
}

@Component({
  selector: 'verification-search-input',
  standalone: true,
  imports: [FormsModule, RefactorInputComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .search {
        align-items: center;
        display: flex;
        position: relative;
      }
      .search > span {
        left: 12px;
        position: absolute;
      }
      .search input {
        padding-left: 35px;
        padding-right: 35px;
      }
      .clear {
        background: transparent;
        border: 0;
        cursor: pointer;
        position: absolute;
        right: 8px;
      }
    `,
  ],
  template: `<refactor-input
    type="search"
    ariaLabel="Buscar"
    leadingIcon="search"
    [clearable]="true"
    [ngModel]="value"
    [ngModelOptions]="{ standalone: true }"
    (ngModelChange)="change($event)"
    [placeholder]="placeholder"
    [disabled]="disabled"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  @Input() value = '';
  @Input() placeholder = 'Buscar…';
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<string>();
  protected change(v: string): void {
    this.value = v;
    this.valueChange.emit(v);
  }
}

@Component({
  selector: 'verification-filter-button',
  standalone: true,
  imports: [FormsModule, RefactorSelectComponent],
  styleUrls: [SHARED],
  styles: [
    `
      :host {
        display: block;
        min-width: 220px;
      }
      @media (max-width: 650px) {
        :host {
          min-width: 0;
          width: 100%;
        }
      }
    `,
  ],
  template: `<refactor-select
    [label]="label"
    [placeholder]="placeholder"
    [options]="options"
    [ngModel]="value"
    [ngModelOptions]="{ standalone: true }"
    (ngModelChange)="select($event)"
    leadingIcon="list-filter"
    [clearable]="clearable"
    ariaLabel="Filtrar solicitudes por estado"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterButtonComponent {
  @Input() label = 'Filtros';
  @Input() placeholder = 'Todos los estados';
  @Input() options: readonly RefactorSelectOption[] = [];
  @Input() value: string | null = null;
  @Input() clearable = true;
  @Output() readonly valueChange = new EventEmitter<string | null>();

  protected select(value: string | null): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}

@Component({
  selector: 'verification-applicant-summary',
  standalone: true,
  imports: [VerificationStatusBadgeComponent, DetailGridComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .applicant {
        padding: 16px;
      }
      .identity {
        align-items: center;
        display: flex;
        gap: 12px;
        margin-bottom: 14px;
      }
      .avatar {
        align-items: center;
        background: var(--v-green-soft);
        border-radius: 50%;
        color: var(--v-green);
        display: flex;
        font-size: 23px;
        height: 54px;
        justify-content: center;
        width: 54px;
      }
      .identity h3 {
        margin: 0;
      }
      .identity p {
        color: var(--v-muted);
        margin: 4px 0;
      }
    `,
  ],
  template: `<article class="v-card applicant">
    <div class="identity">
      <span class="avatar">{{ icon }}</span>
      <div>
        <h3>{{ name }}</h3>
        <p>{{ phone }}</p>
      </div>
      @if (status) {
        <verification-status-badge [status]="status" />
      }
    </div>
    <verification-detail-grid [items]="details" [columns]="columns" />
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicantSummaryCardComponent {
  @Input() name = '';
  @Input() phone = '';
  @Input() icon = '⌂';
  @Input() status?: VerificationStatus;
  @Input() details: readonly DetailItem[] = [];
  @Input() columns: 1 | 2 = 2;
}

@Component({
  selector: 'verification-map-preview',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .map {
        align-items: center;
        background: linear-gradient(135deg, #eef1e8, #dce8df);
        border-radius: 12px;
        display: flex;
        height: 150px;
        justify-content: center;
        overflow: hidden;
        position: relative;
      }
      .map:before,
      .map:after {
        background: rgb(255 255 255 / 70%);
        content: '';
        height: 240%;
        position: absolute;
        transform: rotate(36deg);
        width: 16px;
      }
      .map:after {
        transform: rotate(92deg);
      }
      .pin {
        align-items: center;
        background: var(--v-green);
        border: 5px solid #fff;
        border-radius: 50% 50% 50% 0;
        color: #fff;
        display: flex;
        height: 43px;
        justify-content: center;
        position: relative;
        transform: rotate(-45deg);
        width: 43px;
        z-index: 1;
      }
      .pin span {
        transform: rotate(45deg);
      }
    `,
  ],
  template: `<div class="map" role="img" [attr.aria-label]="location">
    <span class="pin"><span>●</span></span>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPreviewComponent {
  @Input() location = 'Ubicación de la visita';
}

@Component({
  selector: 'verification-declared-summary',
  standalone: true,
  imports: [LucideAngularModule],
  styleUrls: [SHARED],
  styles: [
    `
      .declared {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .item {
        align-items: start;
        display: grid;
        gap: 9px;
        grid-template-columns: 25px 1fr;
      }
      .icon {
        color: var(--v-green);
        height: 18px;
        width: 18px;
      }
      .item-copy {
        display: grid;
        gap: 4px;
        min-width: 0;
      }
      .item strong,
      .item span:last-child {
        display: block;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .item strong {
        font-size: 11px;
      }
      .item span:last-child {
        color: var(--v-muted);
        font-size: 11px;
      }
      @media (max-width: 620px) {
        .declared {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `<div class="declared">
    @for (item of items; track item.label) {
      <div class="item">
        <span class="icon" aria-hidden="true">
          <lucide-icon [name]="item.icon || 'circle'" [size]="18" [strokeWidth]="1.8" />
        </span>
        <div class="item-copy">
          <strong>{{ item.label }}</strong>
          <span>{{ item.value }}</span>
        </div>
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclaredDataSummaryComponent {
  @Input() items: readonly DetailItem[] = [];
}

@Component({
  selector: 'verification-request-table',
  standalone: true,
  imports: [VerificationStatusBadgeComponent, EmptyStateComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .wrap {
        overflow: auto;
      }
      table {
        border-collapse: collapse;
        font-size: 11px;
        min-width: 760px;
        width: 100%;
      }
      th {
        color: var(--v-muted);
        font-size: 10px;
        padding: 10px;
        text-align: left;
      }
      td {
        border-top: 1px solid #edf0f1;
        padding: 13px 10px;
      }
      .row {
        cursor: pointer;
      }
      .row:hover {
        background: #f5faf7;
      }
      .selected {
        background: linear-gradient(90deg, #e9f7ee, #f8fcfa);
        box-shadow: inset 4px 0 var(--v-green);
      }
    `,
  ],
  template: `@if (requests.length) {
      <div class="wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Solicitante</th>
              <th>Teléfono</th>
              <th>Dirección / Área</th>
              <th>Tiempo est.</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            @for (request of requests; track request.folio) {
              <tr
                class="row"
                [class.selected]="request.folio === selectedFolio"
                tabindex="0"
                (click)="selected.emit(request)"
                (keydown.enter)="selected.emit(request)"
              >
                <td>
                  <strong>{{ request.folio }}</strong>
                </td>
                <td>{{ request.applicant }}</td>
                <td>{{ request.phone }}</td>
                <td>{{ request.address }}</td>
                <td>{{ request.estimatedTime }}</td>
                <td><verification-status-badge [status]="request.status" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <verification-empty-state description="No hay solicitudes asignadas." />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestTableComponent {
  @Input() requests: readonly RequestItem[] = [];
  @Input() selectedFolio = '';
  @Output() readonly selected = new EventEmitter<RequestItem>();
}

@Component({
  selector: 'verification-request-detail-card',
  standalone: true,
  imports: [
    VerificationStatusBadgeComponent,
    DeclaredDataSummaryComponent,
    AppButtonComponent,
    LucideAngularModule,
    VerificationLocationComponent,
  ],
  styleUrls: [SHARED],
  styles: [
    `
      .detail {
        padding: 18px;
      }
      .head {
        align-items: center;
        border-bottom: 1px solid var(--v-line);
        display: flex;
        justify-content: space-between;
        padding-bottom: 12px;
      }
      .person {
        display: grid;
        gap: 14px;
        margin: 15px 0;
      }
      .person h3 {
        margin: 0 0 6px;
      }
      .phone {
        align-items: center;
        color: var(--v-muted);
        display: flex;
        font-size: 12px;
        gap: 7px;
      }
      .declared {
        border: 1px solid var(--v-line);
        border-radius: 10px;
        margin: 13px 0;
        padding: 13px;
      }
      .declared h4 {
        font-size: 12px;
        margin: 0 0 12px;
      }
      verification-app-button {
        display: block;
      }
      @media (max-width: 650px) {
        .person {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `<article class="v-card detail">
    <header class="head">
      <strong>{{ request.folio }}</strong
      ><verification-status-badge [status]="request.status" />
    </header>
    <div class="person">
      <div>
        <h3>{{ request.applicant }}</h3>
        <p class="phone">
          <lucide-icon name="phone" [size]="16" [strokeWidth]="1.8" aria-hidden="true" />
          {{ request.phone }}
        </p>
      </div>
      <verification-location
        [placeName]="request.applicant"
        [address]="request.address"
        [latitude]="request.latitude"
        [longitude]="request.longitude"
      />
    </div>
    <section class="declared">
      <h4>Resumen de datos declarados</h4>
      <verification-declared-summary [items]="declaredItems" />
    </section>
    <verification-app-button (pressed)="view.emit(request)"
      >▤ Ver expediente</verification-app-button
    >
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDetailCardComponent {
  @Input({ required: true }) request!: RequestItem;
  @Input() declaredItems: readonly DetailItem[] = [];
  @Output() readonly view = new EventEmitter<RequestItem>();
}

@Component({
  selector: 'verification-visit-summary',
  standalone: true,
  imports: [VerificationStatusBadgeComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 18px;
      }
      .cell {
        border-right: 1px solid var(--v-line);
        padding: 4px 18px;
      }
      .cell:last-child {
        border: 0;
      }
      .cell small {
        color: var(--v-muted);
        display: block;
        margin-bottom: 8px;
      }
      .cell strong {
        display: block;
      }
      .folio {
        font-size: 20px;
      }
      @media (max-width: 760px) {
        .summary {
          grid-template-columns: 1fr 1fr;
        }
        .cell {
          border-bottom: 1px solid var(--v-line);
        }
      }
    `,
  ],
  template: `<article class="v-card summary">
    @if (showFolio) {
      <div class="cell">
        <small>Folio</small><strong class="folio">{{ folio }}</strong
        ><verification-status-badge [status]="status" />
      </div>
    }
    @if (showApplicant) {
      <div class="cell">
        <small>Solicitante</small><strong>{{ applicant }}</strong>
        <p>☎ {{ phone }}</p>
      </div>
    }
    @if (showAddress) {
      <div class="cell">
        <small>Dirección visitada</small><span>{{ address }}</span>
      </div>
    }
    @if (showTime) {
      <div class="cell">
        <small>Tiempo de visita</small><strong>{{ duration }}</strong>
        <p>{{ date }}</p>
      </div>
    }
  </article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitSummaryCardComponent {
  @Input() folio = '';
  @Input() applicant = '';
  @Input() phone = '';
  @Input() address = '';
  @Input() duration = '';
  @Input() date = '';
  @Input() status: VerificationStatus = 'pending';
  @Input() showFolio = true;
  @Input() showApplicant = true;
  @Input() showAddress = true;
  @Input() showTime = true;
}
