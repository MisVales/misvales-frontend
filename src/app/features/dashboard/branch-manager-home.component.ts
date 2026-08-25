import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  StatusBadgeComponent,
  StatusBadgeTone,
} from '@shared/components/badges/semantic-status-badge/status-badge.component';
import {
  BranchReportsHome,
  ReportsApiService,
} from '@features/reports/data-access/reports-api.service';

interface ChartGeometry {
  points: string;
  area: string;
  max: number;
}

@Component({
  selector: 'app-branch-manager-home',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, StatusBadgeComponent],
  templateUrl: './branch-manager-home.component.html',
  styleUrl: './branch-manager-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchManagerHomeComponent implements OnInit {
  private readonly reportsApi = inject(ReportsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<BranchReportsHome | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly chart = computed<ChartGeometry>(() => chartGeometry(this.data()?.points.trend ?? []));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.reportsApi
      .home()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible consultar los reportes de la sucursal.');
          this.loading.set(false);
        },
      });
  }

  formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  formatNumber(value: string | number): string {
    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  formatDate(value: string): string {
    if (!value) return 'Sin dato';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  formatMonth(value: string): string {
    return new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' }).format(
      new Date(`${value.slice(0, 7)}-02T12:00:00`),
    );
  }

  applicationStatusLabel(status: string): string {
    return APPLICATION_STATUS_LABELS[status] ?? 'En proceso';
  }

  applicationStatusTone(status: string): StatusBadgeTone {
    if (['ACTIVE', 'AUTHORIZED_PENDING_ACTIVATION'].includes(status)) return 'green';
    if (['REJECTED', 'TERMINATED_UNFAVORABLE'].includes(status)) return 'red';
    if (['DRAFT', 'COORDINATOR_REVIEW', 'COORDINATOR_CORRECTION'].includes(status)) return 'orange';
    return 'blue';
  }
}

const APPLICATION_STATUS_LABELS: Readonly<Record<string, string>> = {
  DRAFT: 'Borrador',
  COORDINATOR_REVIEW: 'Revisión',
  VERIFIER_ASSIGNED: 'Verificador asignado',
  PHYSICAL_VERIFICATION: 'En verificación',
  COORDINATOR_CORRECTION: 'Con correcciones',
  COORDINATOR_EVALUATION: 'En evaluación',
  MANAGER_AUTHORIZATION: 'Por autorizar',
  TERMINATED_UNFAVORABLE: 'No favorable',
  REJECTED: 'Rechazada',
  AUTHORIZED_PENDING_ACTIVATION: 'Autorizada',
  ACTIVE: 'Activa',
};

export function chartGeometry(trend: readonly { points: number }[]): ChartGeometry {
  const width = 560;
  const height = 130;
  const top = 12;
  const bottom = 118;
  const max = Math.max(1, ...trend.map((item) => item.points));
  const coordinates = trend.map((item, index) => {
    const x = trend.length <= 1 ? width / 2 : (index / (trend.length - 1)) * width;
    const y = bottom - (Math.max(0, item.points) / max) * (bottom - top);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return {
    points: coordinates.join(' '),
    area: coordinates.length ? `0,${bottom} ${coordinates.join(' ')} ${width},${bottom}` : '',
    max,
  };
}
