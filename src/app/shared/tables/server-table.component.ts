import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TableColumn<T> {
  readonly key: keyof T;
  readonly label: string;
  readonly sortable?: boolean;
}

export interface TablePageEvent {
  readonly page: number;
  readonly perPage: number;
}

export interface TableSortEvent<T> {
  readonly key: keyof T;
  readonly direction: 'asc' | 'desc';
}

export type TableLoadState = 'content' | 'empty' | 'error' | 'loading';

@Component({
  selector: 'mv-server-table',
  templateUrl: './server-table.component.html',
  styleUrl: './server-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerTableComponent<T extends object> {
  readonly caption = input.required<string>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly state = input<TableLoadState>('content');
  readonly currentPage = input(1);
  readonly perPage = input(15);
  readonly total = input(0);
  readonly sortEnabled = input(false);
  readonly pageChange = output<TablePageEvent>();
  readonly sortChange = output<TableSortEvent<T>>();
  private sortDirection: 'asc' | 'desc' = 'asc';

  value(row: T, column: TableColumn<T>): unknown {
    return row[column.key];
  }

  sort(column: TableColumn<T>): void {
    if (!this.sortEnabled() || !column.sortable) {
      return;
    }

    this.sortChange.emit({
      key: column.key,
      direction: this.sortDirection,
    });
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  move(delta: number): void {
    const page = this.currentPage() + delta;
    if (page < 1 || (delta > 0 && page > this.lastPage())) {
      return;
    }

    this.pageChange.emit({ page, perPage: this.perPage() });
  }

  lastPage(): number {
    return Math.max(1, Math.ceil(this.total() / this.perPage()));
  }
}
