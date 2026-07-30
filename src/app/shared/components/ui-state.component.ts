import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type UiStateKind =
  'denied' | 'empty' | 'error' | 'fatal' | 'loading' | 'not-found' | 'offline' | 'success';

const DEFAULT_TITLES: Readonly<Record<UiStateKind, string>> = {
  denied: 'Acceso denegado',
  empty: 'Sin resultados',
  error: 'No fue posible cargar esta sección',
  fatal: 'Ocurrió un error técnico',
  loading: 'Cargando',
  'not-found': 'Ruta no encontrada',
  offline: 'Sin conexión',
  success: 'Operación completada',
};

@Component({
  selector: 'mv-ui-state',
  templateUrl: './ui-state.component.html',
  styleUrl: './ui-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiStateComponent {
  readonly kind = input.required<UiStateKind>();
  readonly title = input<string | null>(null);
  readonly message = input<string | null>(null);
  readonly requestId = input<string | null>(null);
  readonly retryable = input(false);
  readonly retry = output<void>();

  resolvedTitle(): string {
    return this.title() ?? DEFAULT_TITLES[this.kind()];
  }
}
