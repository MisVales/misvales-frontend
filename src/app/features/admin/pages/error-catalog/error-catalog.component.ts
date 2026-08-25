import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ErrorCatalogItem, ErrorCatalogService } from '../../data-access/error-catalog.service';

@Component({
  selector: 'app-error-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './error-catalog.component.html',
  styleUrl: './error-catalog.component.css',
})
export class ErrorCatalogComponent {
  private readonly catalog = inject(ErrorCatalogService);

  readonly items = signal<ErrorCatalogItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly status = signal('');
  readonly expanded = signal<string | null>(null);

  readonly statuses = computed(() =>
    [...new Set(this.items().flatMap((item) => item.http_statuses))].sort((a, b) => a - b),
  );
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('es-MX');
    const status = Number(this.status());
    return this.items().filter((item) => {
      const matchesStatus = !status || item.http_statuses.includes(status);
      const haystack = [item.code, ...item.client_messages]
        .join(' ')
        .toLocaleLowerCase('es-MX');
      return matchesStatus && (!query || haystack.includes(query));
    });
  });

  constructor() {
    this.catalog.list().subscribe({
      next: ({ data }) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar el diccionario de errores. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

  setQuery(value: string): void { this.query.set(value); }
  setStatus(value: string): void { this.status.set(value); }
  toggle(code: string): void { this.expanded.set(this.expanded() === code ? null : code); }

  statusTone(status: number): string {
    if (status >= 500) return 'critical';
    if (status >= 400) return 'warning';
    return 'neutral';
  }
}
