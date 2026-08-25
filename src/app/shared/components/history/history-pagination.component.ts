import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-history-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" [attr.aria-label]="label">
      <p>Página {{ page }} de {{ pages }} · {{ total }} {{ noun }}</p>
      <div>
        <button type="button" [disabled]="busy || page <= 1" (click)="previous.emit()">
          Anterior
        </button>
        <button type="button" [disabled]="busy || page >= pages" (click)="next.emit()">
          Siguiente
        </button>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    .pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8e4;
      color: #596b60;
      font-size: 0.86rem;
    }
    p {
      margin: 0;
    }
    div {
      display: flex;
      gap: 0.5rem;
    }
    button {
      min-height: 2.75rem;
      padding: 0 1rem;
      border: 1px solid #cbd8cf;
      border-radius: 0.65rem;
      background: #fff;
      color: #263c2e;
      font-weight: 700;
    }
    button:hover:not(:disabled) {
      border-color: #3c8b5d;
      background: #f0f8f3;
    }
    button:focus-visible {
      outline: 2px solid #238553;
      outline-offset: 2px;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  `,
})
export class HistoryPaginationComponent {
  @Input() page = 1;
  @Input() pages = 1;
  @Input() total = 0;
  @Input() noun = 'registros';
  @Input() label = 'Paginación del historial';
  @Input() busy = false;
  @Output() readonly previous = new EventEmitter<void>();
  @Output() readonly next = new EventEmitter<void>();
}
