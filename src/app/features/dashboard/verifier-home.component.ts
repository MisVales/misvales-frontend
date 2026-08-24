import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { VerificacionDistribuidorasApiService } from '@features/verifications/data-access/api/verificacion-distribuidoras-api.service';
import { EmptyStateComponent } from '@shared/components/status/empty-state/empty-state.component';
import type { VisitaVerificacionResponseDto } from '@features/verifications/data-access/dtos/verificacion-distribuidoras.dtos';

type Visit = VisitaVerificacionResponseDto;
type ActivityTone = 'blue' | 'green' | 'orange' | 'red' | 'purple';

interface ActivityItem {
  id: string;
  icon: string;
  tone: ActivityTone;
  text: string;
  date: string;
}

@Component({
  selector: 'app-verifier-home',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule, EmptyStateComponent],
  templateUrl: './verifier-home.component.html',
  styleUrl: './verifier-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifierHomeComponent {
  private readonly api = inject(VerificacionDistribuidorasApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly visits = signal<Visit[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly todayKey = localDateKey(new Date());

  readonly assigned = computed(() => this.visits().filter((visit) => visit.status === 'ASSIGNED'));
  readonly inProgress = computed(() => this.visits().filter((visit) => visit.status === 'IN_PROGRESS'));
  readonly completedToday = computed(() => this.visits().filter((visit) => visit.status === 'COMPLETED' && localDateKey(visit.completed_at) === this.todayKey));
  readonly completedFavorableToday = computed(() => this.completedToday().filter((visit) => visit.result === 'FAVORABLE').length);
  readonly completedUnfavorableToday = computed(() => this.completedToday().filter((visit) => visit.result === 'UNFAVORABLE').length);
  readonly withDifferences = computed(() => this.inProgress().filter((visit) => differenceCount(visit) > 0).length);
  readonly upcoming = computed(() => [...this.visits()].filter((visit) => visit.status !== 'COMPLETED' && Boolean(visit.scheduled_for)).sort((a, b) => timestamp(a.scheduled_for) - timestamp(b.scheduled_for)));
  readonly nextVisit = computed(() => this.upcoming()[0] ?? null);
  readonly visibleVisits = computed(() => this.upcoming().slice(0, 5));
  readonly pending = computed(() => [...this.inProgress(), ...this.assigned()].sort((a, b) => timestamp(a.scheduled_for) - timestamp(b.scheduled_for)).slice(0, 5));
  readonly activities = computed<ActivityItem[]>(() => this.visits().flatMap((visit) => {
    const reference = visit.application?.application_number || applicant(visit);
    const items: ActivityItem[] = [];
    if (visit.assigned_at) items.push({ id: `${visit.id}-assigned`, icon: 'file-text', tone: 'blue', text: `Nueva visita asignada: ${reference}`, date: visit.assigned_at });
    if (visit.started_at) items.push({ id: `${visit.id}-started`, icon: 'circle-play', tone: 'orange', text: `Visita iniciada: ${reference}`, date: visit.started_at });
    if (differenceCount(visit) && (visit.started_at || visit.assigned_at)) items.push({ id: `${visit.id}-differences`, icon: 'triangle-alert', tone: 'red', text: `${differenceCount(visit)} diferencia${differenceCount(visit) === 1 ? '' : 's'} registrada${differenceCount(visit) === 1 ? '' : 's'} en ${reference}`, date: visit.started_at || visit.assigned_at! });
    if (visit.completed_at) items.push({ id: `${visit.id}-completed`, icon: 'circle-check', tone: visit.result === 'UNFAVORABLE' ? 'red' : 'green', text: `Visita finalizada: ${reference} · ${resultLabel(visit.result)}`, date: visit.completed_at });
    return items;
  }).sort((a, b) => timestamp(b.date) - timestamp(a.date)).slice(0, 6));

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listarVisitasAsignadas({ page: 1, perPage: 100 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { this.visits.set(response.data); this.loading.set(false); },
      error: () => { this.error.set('No fue posible cargar tu panel de visitas.'); this.loading.set(false); },
    });
  }

  applicant(visit: Visit): string { return applicant(visit); }
  branch(visit: Visit): string { return visit.application?.branch?.name || 'Sin sucursal'; }
  coordinator(visit: Visit): string { return visit.application?.coordinator?.name || 'Sin coordinador'; }
  statusLabel(status: string): string { return status === 'IN_PROGRESS' ? 'En proceso' : status === 'COMPLETED' ? 'Terminada' : 'Asignada'; }
  differenceCount(visit: Visit): number { return differenceCount(visit); }
  pendingLabel(visit: Visit): string { return visit.status === 'ASSIGNED' ? 'Iniciar visita' : visit.media_files.length ? 'Completar resultado' : 'Faltan evidencias'; }
  priorityLabel(visit: Visit): string { return timestamp(visit.scheduled_for) < Date.now() ? 'Alta' : localDateKey(visit.scheduled_for) === this.todayKey ? 'Media' : 'Próxima'; }
  relativeTime(value: string): string { return relativeTime(value); }
  visitRoute(visit: Visit): string[] { return visit.status === 'ASSIGNED' ? ['/verificacion-distribuidoras/verificaciones/asignadas'] : ['/verificacion-distribuidoras/verificaciones', visit.id, 'visita']; }
}

function applicant(visit: Visit): string { return visit.application?.applicant?.full_name || visit.application?.application_number || 'Solicitud asignada'; }
function differenceCount(visit: Visit): number { return visit.differences_payload?.items?.length || 0; }
function resultLabel(result: string | null): string { return result === 'UNFAVORABLE' ? 'Desfavorable' : result === 'FAVORABLE' ? 'Favorable' : 'Terminada'; }
function timestamp(value: string | null | undefined): number { const parsed = value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER; return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed; }
function localDateKey(value: string | Date | null | undefined): string { if (!value) return ''; const parsed = value instanceof Date ? value : new Date(value); if (Number.isNaN(parsed.getTime())) return ''; return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed); }
function relativeTime(value: string): string { const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); if (minutes < 1) return 'Ahora'; if (minutes < 60) return `Hace ${minutes} min`; const hours = Math.floor(minutes / 60); if (hours < 24) return `Hace ${hours} h`; const days = Math.floor(hours / 24); return `Hace ${days} d`; }
