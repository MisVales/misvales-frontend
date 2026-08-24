import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CreditoApiService } from '@features/credit/data-access/credito-api.service';
import { CajaValesApiService } from '@features/counter/data-access/caja-vales-api.service';
import { ExcedentesApiService } from '@features/payments/data-access/excedentes-api.service';
import { ConciliacionApiService } from '@features/reconciliation/data-access/conciliacion-api.service';
import { RelacionesApiService } from '@features/relations/data-access/relaciones-api.service';
import {
  ReportsApiService,
  type BranchReportsHome,
} from '@features/reports/data-access/reports-api.service';
import { ValesApiService } from '@features/vouchers/data-access/vales-api.service';
import { PuntosApiService } from '@features/points/data-access/puntos-api.service';
import { VerificacionDistribuidorasApiService } from '@features/verifications/data-access/api/verificacion-distribuidoras-api.service';
import type {
  SolicitudDistribuidoraResponseDto,
  VisitaVerificacionResponseDto,
} from '@features/verifications/data-access/dtos/verificacion-distribuidoras.dtos';
import type { RoleCode } from '@core/config/experience/experience.models';
import type { DashboardData, DashboardSection, DashboardTone } from './dashboard.models';
import { DashboardOperationApiService } from './dashboard-operation-api.service';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly reports = inject(ReportsApiService);
  private readonly verification = inject(VerificacionDistribuidorasApiService);
  private readonly reconciliation = inject(ConciliacionApiService);
  private readonly cashier = inject(CajaValesApiService);
  private readonly operationDashboard = inject(DashboardOperationApiService);
  private readonly surpluses = inject(ExcedentesApiService);
  private readonly credit = inject(CreditoApiService);
  private readonly vouchers = inject(ValesApiService);
  private readonly relations = inject(RelacionesApiService);
  private readonly points = inject(PuntosApiService);

  load(role: RoleCode): Observable<DashboardData> {
    if (['general_manager', 'branch_manager', 'admin'].includes(role)) {
      return forkJoin({
        reports: this.reports.home(),
        operations: this.operationDashboard.summary(),
      }).pipe(map(({ reports, operations }) => reportDashboard(reports, operations, role)));
    }
    if (role === 'cashier') return this.loadCashier();
    if (role === 'coordinator') return this.loadCoordinator();
    if (role === 'verifier') return this.loadVerifier();
    if (role === 'distributor') return this.loadDistributor();
    return new Observable((subscriber) => {
      subscriber.next({ kpis: [], sections: [] });
      subscriber.complete();
    });
  }

  private loadCashier(): Observable<DashboardData> {
    return forkJoin({
      operationSummary: this.operationDashboard.summary(),
      voucherHistory: this.cashier.list('history'),
      movements: this.reconciliation.movements(),
      clarifications: this.reconciliation.clarifications(),
      manual: this.reconciliation.manualRequests(),
      refunds: this.surpluses.refunds(),
    }).pipe(
      map(({ operationSummary, voucherHistory, movements, clarifications, manual, refunds }) => {
        const today = localDateKey(new Date());
        const cashedToday = voucherHistory.filter(
          (item) => item.status === 'CASHED' && localDateKey(item.cashed_at) === today,
        );
        const movementsToday = movements.filter((item) => localDateKey(item.paid_at) === today);
        const pendingClarifications = clarifications.filter(
          (item) => !['RESOLVED', 'REJECTED'].includes(item.status),
        );
        const pendingManual = manual.filter(
          (item) => !['EXECUTED', 'REJECTED'].includes(item.status),
        );
        const authorizedRefunds = refunds.filter((item) => item.status === 'AUTHORIZED');
        const recentActivity = [
          ...cashedToday.map((item) => ({
            id: `voucher-${item.id}`,
            date: item.cashed_at || item.generated_at,
            type: 'Vale feriado',
            reference: item.folio,
            distributor:
              item.distributor?.full_name || item.distributor?.distributor_number || 'Sin dato',
            amount: item.capital,
            status: 'Completado',
            tone: 'green' as const,
          })),
          ...movementsToday.map((item) => ({
            id: `payment-${item.id}`,
            date: item.paid_at,
            type: 'Pago registrado',
            reference: item.payment_reference,
            distributor:
              item.distributor_name || item.distributor_number || 'Sin relación identificada',
            amount: item.amount,
            status: reconciliationLabel(item.reconciliation_status),
            tone: reconciliationTone(item.reconciliation_status),
          })),
          ...pendingClarifications.map((item) => ({
            id: `clarification-${item.id}`,
            date: item.created_at,
            type: 'Aclaración',
            reference: item.folio || item.relation_reference,
            distributor: item.distributor_name || item.distributor_number || 'Sin dato',
            amount: item.relation_balance || '0',
            status: statusLabel(item.status),
            tone: 'orange' as const,
          })),
        ]
          .sort((left, right) => timestamp(right.date) - timestamp(left.date))
          .slice(0, 6);
        return {
          kpis: [
            kpi(
              'vouchers-today',
              'Vales feriados hoy',
              number(operationSummary.vouchers.cashed_today),
              'ticket-check',
              'green',
              `${number(operationSummary.vouchers.pending)} pendientes`,
              '/vales/caja-feriado',
            ),
            kpi(
              'voucher-amount-today',
              'Monto feriado hoy',
              money(operationSummary.vouchers.amount_today),
              'receipt-text',
              'green',
              'Capital entregado en caja',
              '/vales/caja-feriado',
            ),
            kpi(
              'payments-today',
              'Movimientos bancarios hoy',
              number(operationSummary.payments.registered_today),
              'badge-dollar-sign',
              'blue',
              money(operationSummary.payments.amount_today),
              '/relaciones-pagos/pagos',
            ),
            kpi(
              'received-today',
              'Pagos conciliados hoy',
              number(operationSummary.reconciliation.reconciled_today),
              'landmark',
              'blue',
              money(operationSummary.reconciliation.reconciled_amount_today),
              '/relaciones-pagos/pagos',
            ),
            kpi(
              'unreconciled',
              'Pagos sin conciliar',
              number(operationSummary.reconciliation.pending),
              'git-merge',
              operationSummary.reconciliation.pending ? 'purple' : 'green',
              `${number(operationSummary.reconciliation.manual_pending)} solicitudes manuales`,
              '/relaciones-pagos/conciliacion',
            ),
            kpi(
              'clarifications',
              'Aclaraciones',
              number(
                operationSummary.clarifications.pending +
                  operationSummary.clarifications.authorized_refunds,
              ),
              'alert-triangle',
              operationSummary.clarifications.pending ||
                operationSummary.clarifications.authorized_refunds
                ? 'orange'
                : 'green',
              operationSummary.clarifications.authorized_refunds
                ? `${number(operationSummary.clarifications.authorized_refunds)} devoluciones autorizadas`
                : 'Sin devoluciones por ejecutar',
              '/relaciones-pagos/aclaraciones',
            ),
          ],
          sections: [
            {
              id: 'cashier-activity',
              kind: 'table',
              category: 'activity',
              title: 'Actividad reciente',
              icon: 'clock',
              description: 'Vales, pagos y aclaraciones registrados hoy',
              route: '/relaciones-pagos/pagos',
              routeLabel: 'Ver todos',
              emptyMessage: 'No hay movimientos para mostrar.',
              span: 'wide',
              columns: [
                { key: 'date', label: 'Fecha' },
                { key: 'type', label: 'Resultado' },
                { key: 'reference', label: 'Referencia' },
                { key: 'distributor', label: 'Distribuidora' },
                { key: 'amount', label: 'Monto', align: 'end' },
                { key: 'status', label: 'Estado' },
              ],
              rows: recentActivity.map((item) => ({
                id: item.id,
                cells: {
                  date: time(item.date),
                  type: item.type,
                  reference: item.reference,
                  distributor: item.distributor,
                  amount: money(item.amount),
                  status: '',
                },
                status: {
                  key: 'status',
                  label: item.status,
                  tone: item.tone,
                },
              })),
            },
            {
              id: 'cashier-pending',
              kind: 'list',
              category: 'pending',
              title: 'Pendientes',
              icon: 'inbox',
              route: '/relaciones-pagos/aclaraciones',
              routeLabel: 'Atender',
              emptyMessage: 'No hay pendientes disponibles.',
              items: [
                ...pendingClarifications.slice(0, 3).map((item) => ({
                  id: item.id,
                  title: 'Aclaración por revisar',
                  subtitle: item.relation_reference,
                  meta: dateTime(item.created_at),
                  icon: 'message-square',
                  tone: 'orange' as const,
                  status: statusLabel(item.status),
                  route: '/relaciones-pagos/aclaraciones',
                })),
                ...pendingManual.slice(0, 3).map((item) => ({
                  id: item.id,
                  title: 'Conciliación manual',
                  subtitle: item.relation_reference,
                  meta: dateTime(item.created_at),
                  icon: 'git-merge',
                  tone: 'purple' as const,
                  status: statusLabel(item.status),
                  route: '/relaciones-pagos/aclaraciones',
                })),
                ...authorizedRefunds.slice(0, 2).map((item) => ({
                  id: item.id,
                  title: 'Devolución autorizada',
                  subtitle: item.origin_relation_reference || item.distributor_name || 'Excedente',
                  meta: money(item.amount),
                  icon: 'hand-coins',
                  tone: 'orange' as const,
                  status: 'Registrar',
                  route: '/relaciones-pagos/aclaraciones',
                })),
              ],
            },
            {
              id: 'cashier-movements',
              kind: 'table',
              category: 'activity',
              title: 'Movimientos del día',
              icon: 'arrow-left-right',
              description: 'Resultados del archivo bancario para la fecha actual',
              route: '/relaciones-pagos/conciliacion',
              routeLabel: 'Ver todos',
              emptyMessage: 'No hay movimientos bancarios registrados hoy.',
              columns: [
                { key: 'time', label: 'Hora' },
                { key: 'result', label: 'Resultado' },
                { key: 'folio', label: 'Folio' },
                { key: 'distributor', label: 'Distribuidora' },
                { key: 'amount', label: 'Monto', align: 'end' },
                { key: 'status', label: 'Estado' },
              ],
              rows: movementsToday.slice(0, 8).map((item) => ({
                id: item.id,
                cells: {
                  time: time(item.paid_at),
                  result: movementLabel(item.result),
                  folio: item.bank_folio || item.payment_reference,
                  distributor: item.distributor_name || item.distributor_number || 'Sin dato',
                  amount: money(item.amount),
                  status: '',
                },
                status: {
                  key: 'status',
                  label: reconciliationLabel(item.reconciliation_status),
                  tone: reconciliationTone(item.reconciliation_status),
                },
              })),
            },
          ],
          generatedAt: operationSummary.generated_at,
        };
      }),
    );
  }

  private loadCoordinator(): Observable<DashboardData> {
    return this.verification.listarSolicitudes({ page: 1, perPage: 20 }).pipe(
      map((page) => {
        const statuses = countStatuses(page.data.map((item) => item.status));
        return {
          kpis: [
            kpi('total', 'Solicitudes', number(page.total), 'clipboard-list', 'green'),
            kpi(
              'review',
              'En revisión visible',
              number(statuses['COORDINATOR_REVIEW'] || 0),
              'clock',
              'orange',
              'En esta carga',
            ),
            kpi(
              'verification',
              'En verificación visible',
              number(
                (statuses['VERIFIER_ASSIGNED'] || 0) + (statuses['PHYSICAL_VERIFICATION'] || 0),
              ),
              'map-pin',
              'blue',
              'En esta carga',
            ),
            kpi(
              'corrections',
              'Con correcciones visibles',
              number(statuses['COORDINATOR_CORRECTION'] || 0),
              'file-text',
              'purple',
              'En esta carga',
            ),
          ],
          sections: [applicationTable(page.data), applicationSummary(statuses, page.data.length)],
        };
      }),
    );
  }

  private loadVerifier(): Observable<DashboardData> {
    return this.verification.listarVisitasAsignadas({ page: 1, perPage: 20 }).pipe(
      map((page) => {
        const statuses = countStatuses(page.data.map((item) => item.status));
        const differences = page.data.filter(
          (item) => (item.differences_payload?.items?.length || 0) > 0,
        ).length;
        return {
          kpis: [
            kpi('total', 'Visitas asignadas', number(page.total), 'clipboard-check', 'green'),
            kpi(
              'pending',
              'Pendientes visibles',
              number(statuses['ASSIGNED'] || 0),
              'clock',
              'orange',
              'En esta carga',
            ),
            kpi(
              'progress',
              'En visita visibles',
              number(statuses['IN_PROGRESS'] || 0),
              'map-pin',
              'blue',
              'En esta carga',
            ),
            kpi(
              'differences',
              'Con diferencias visibles',
              number(differences),
              'alert-triangle',
              differences ? 'red' : 'green',
              'En esta carga',
            ),
          ],
          sections: [visitList(page.data), visitSummary(statuses, page.data.length, differences)],
        };
      }),
    );
  }

  private loadDistributor(): Observable<DashboardData> {
    return forkJoin({
      credit: this.credit.consultarMiLinea(),
      vouchers: this.vouchers.listar(1),
      relations: this.relations.list({ page: 1, per_page: 6 }),
      points: this.points.getBalance(),
    }).pipe(
      map(({ credit, vouchers, relations, points }) => {
        const pendingRelations = relations.data.filter((item) => Number(item.balance) > 0);
        const priorityRelation = [...pendingRelations].sort((left, right) => {
          const overdue =
            Number(right.financial_status === 'OVERDUE') -
            Number(left.financial_status === 'OVERDUE');
          return (
            overdue || timestamp(left.payment_deadline_at) - timestamp(right.payment_deadline_at)
          );
        })[0];
        return {
          kpis: [
            kpi(
              'authorized',
              'Línea autorizada',
              money(credit.total_authorized),
              'credit-card',
              'green',
            ),
            kpi('used', 'Crédito utilizado', money(credit.used_balance), 'banknote', 'orange'),
            kpi(
              'available',
              'Crédito disponible',
              money(credit.available_balance),
              'wallet',
              'blue',
            ),
            kpi(
              'relations',
              'Relaciones con saldo',
              number(pendingRelations.length),
              'receipt-text',
              pendingRelations.length ? 'orange' : 'green',
            ),
          ],
          sections: [
            {
              id: 'credit-summary',
              kind: 'summary',
              category: 'report',
              title: 'Mi línea de crédito',
              icon: 'credit-card',
              route: '/distribuidoras/lineas-credito',
              routeLabel: 'Ver detalle',
              emptyMessage: 'No hay información de crédito disponible.',
              summary: [
                {
                  id: 'total',
                  label: 'Línea total',
                  value: money(credit.total_authorized),
                  tone: 'green',
                },
                {
                  id: 'used',
                  label: 'Utilizada',
                  value: money(credit.used_balance),
                  tone: 'orange',
                },
                {
                  id: 'available',
                  label: 'Disponible',
                  value: money(credit.available_balance),
                  tone: 'blue',
                },
              ],
            },
            {
              id: 'financial-attention',
              kind: 'summary',
              category: 'alert',
              title: 'Atención financiera',
              icon: 'alert-triangle',
              route: '/relaciones-pagos/relaciones',
              routeLabel: 'Revisar relaciones',
              emptyMessage: 'No hay relaciones que requieran atención.',
              summary: priorityRelation
                ? [
                    {
                      id: 'reference',
                      label:
                        priorityRelation.financial_status === 'OVERDUE'
                          ? 'Relación vencida prioritaria'
                          : 'Próxima relación a vencer',
                      value: priorityRelation.payment_reference,
                      tone: priorityRelation.financial_status === 'OVERDUE' ? 'red' : 'orange',
                    },
                    {
                      id: 'deadline',
                      label: 'Fecha límite',
                      value: date(priorityRelation.payment_deadline_at),
                    },
                    {
                      id: 'balance',
                      label: 'Saldo pendiente',
                      value: money(priorityRelation.balance),
                      tone: 'orange',
                    },
                    {
                      id: 'count',
                      label: 'Relaciones con saldo',
                      value: number(pendingRelations.length),
                    },
                  ]
                : [],
            },
            {
              id: 'recent-vouchers',
              kind: 'list',
              category: 'activity',
              title: 'Vales recientes',
              icon: 'ticket-check',
              route: '/vales',
              routeLabel: 'Ver todos',
              emptyMessage: 'Aún no hay vales para mostrar.',
              items: vouchers.data.slice(0, 4).map((item) => ({
                id: item.id,
                title: item.client?.full_name || item.folio,
                subtitle: `${item.product?.name || 'Vale'} · ${item.folio}`,
                meta: money(item.client_total),
                icon: 'ticket',
                tone: voucherTone(item.status),
                status: voucherStatus(item.status),
                route: '/vales',
              })),
            },
            {
              id: 'pending-relations',
              kind: 'list',
              category: 'pending',
              title: 'Relaciones con saldo',
              icon: 'receipt-text',
              route: '/relaciones-pagos/relaciones',
              routeLabel: 'Ver todas',
              emptyMessage: 'No hay relaciones con saldo pendiente.',
              items: pendingRelations.map((item) => ({
                id: item.id,
                title: item.payment_reference,
                subtitle: `Fecha límite ${date(item.payment_deadline_at)}`,
                meta: money(item.balance),
                icon: 'receipt-text',
                tone: relationTone(item.financial_status),
                status: relationStatus(item.financial_status),
                route: '/relaciones-pagos/relaciones',
              })),
            },
            {
              id: 'points-summary',
              kind: 'summary',
              category: 'summary',
              title: 'Puntos',
              icon: 'coins',
              route: '/puntos',
              routeLabel: 'Ver puntos',
              emptyMessage: 'No hay información de puntos disponible.',
              summary: [
                {
                  id: 'balance',
                  label: 'Saldo',
                  value: `${number(points.balance)} pts`,
                  tone: 'green',
                },
                {
                  id: 'available',
                  label: 'Disponibles',
                  value: `${number(points.available_points)} pts`,
                },
                {
                  id: 'equivalent',
                  label: 'Valor equivalente',
                  value: money(points.total_money_equivalent),
                  tone: 'blue',
                },
                {
                  id: 'reserved',
                  label: 'En proceso de canje',
                  value: `${number(points.reserved)} pts`,
                  tone: points.reserved ? 'orange' : 'green',
                },
              ],
            },
            {
              id: 'distributor-activity',
              kind: 'list',
              category: 'activity',
              title: 'Actividad reciente',
              icon: 'activity',
              emptyMessage: 'Aún no hay actividad reciente para mostrar.',
              items: [
                ...vouchers.data.slice(0, 3).map((item) => ({
                  id: `activity-voucher-${item.id}`,
                  title: 'Vale registrado',
                  subtitle: item.folio,
                  meta: voucherStatus(item.status),
                  icon: 'ticket',
                  tone: voucherTone(item.status),
                })),
                ...relations.data.slice(0, 3).map((item) => ({
                  id: `activity-relation-${item.id}`,
                  title: Number(item.balance) > 0 ? 'Relación con saldo' : 'Relación liquidada',
                  subtitle: item.payment_reference,
                  meta: money(item.balance),
                  icon: 'receipt-text',
                  tone: relationTone(item.financial_status),
                })),
              ],
            },
          ],
        };
      }),
    );
  }
}

function reportDashboard(
  report: BranchReportsHome,
  operation: import('./dashboard-operation-api.service').OperationDashboardSummary,
  role: RoleCode,
): DashboardData {
  const sections: DashboardSection[] = [
    {
      id: 'applications',
      kind: 'table',
      category: 'activity',
      title: 'Solicitudes recientes',
      icon: 'clipboard-list',
      route: '/solicitudes-distribuidoras',
      routeLabel: 'Ver todas',
      emptyMessage: 'No hay solicitudes disponibles.',
      span: 'wide',
      columns: [
        { key: 'folio', label: 'Folio' },
        { key: 'applicant', label: 'Solicitante' },
        { key: 'branch', label: 'Sucursal' },
        { key: 'date', label: 'Fecha' },
        { key: 'status', label: 'Estado' },
      ],
      rows: report.applications.rows.map((row) => ({
        id: row.application_number,
        cells: {
          folio: row.application_number,
          applicant: row.applicant_name || 'Sin dato',
          branch: row.branch_name,
          date: date(row.created_at),
          status: '',
        },
        status: {
          key: 'status',
          label: applicationStatus(row.status),
          tone: applicationTone(row.status),
        },
      })),
    },
    {
      id: 'delinquency',
      kind: 'table',
      category: 'alert',
      title: 'Morosidad vigente',
      icon: 'shield-alert',
      route: '/riesgo',
      routeLabel: 'Ver reporte',
      emptyMessage: 'No hay distribuidoras con morosidad vigente.',
      columns: [
        { key: 'distributor', label: 'Distribuidora' },
        { key: 'branch', label: 'Sucursal' },
        { key: 'relations', label: 'Cortes', align: 'end' },
        { key: 'balance', label: 'Saldo vencido', align: 'end' },
        { key: 'status', label: 'Estado' },
      ],
      rows: report.delinquency.rows.map((row) => ({
        id: row.distributor_number,
        cells: {
          distributor: row.distributor_name || row.distributor_number,
          branch: row.branch_name,
          relations: number(row.overdue_relations),
          balance: money(row.overdue_balance),
          status: '',
        },
        status: { key: 'status', label: 'Atención', tone: 'orange' },
      })),
    },
    {
      id: 'cutoffs',
      kind: 'table',
      category: 'report',
      title: 'Saldo de cortes',
      icon: 'file-stack',
      route: '/relaciones-pagos/relaciones',
      routeLabel: 'Ver reporte',
      emptyMessage: 'No hay cortes con saldo pendiente.',
      columns: [
        { key: 'cutoff', label: 'Fecha de corte' },
        { key: 'branch', label: 'Sucursal' },
        { key: 'distributors', label: 'Distribuidoras', align: 'end' },
        { key: 'balance', label: 'Saldo', align: 'end' },
        { key: 'deadline', label: 'Fecha límite' },
      ],
      rows: report.cutoffs.rows.map((row) => ({
        id: `${row.cutoff_at}-${row.branch_name}`,
        cells: {
          cutoff: date(row.cutoff_at),
          branch: row.branch_name,
          distributors: number(row.distributors),
          balance: money(row.total_balance),
          deadline: date(row.payment_deadline_at),
        },
      })),
    },
    {
      id: 'points',
      kind: 'chart',
      category: 'report',
      title: 'Movimiento de puntos',
      description: `${number(report.points.available_points)} puntos disponibles`,
      icon: 'chart-no-axes-combined',
      route: '/puntos',
      routeLabel: 'Ver reporte',
      emptyMessage: 'No hay movimientos de puntos en el periodo.',
      chartValueLabel: 'Movimiento mensual de puntos',
      chart: report.points.trend.map((point) => ({
        label: month(point.period),
        value: point.points,
      })),
    },
  ];
  return {
    generatedAt: report.generated_at,
    kpis: [
      kpi(
        'pending-decisions',
        'Pendientes de decisión',
        number(report.applications.pending + operation.reconciliation.manual_pending),
        'inbox',
        report.applications.pending + operation.reconciliation.manual_pending ? 'orange' : 'green',
        `${number(report.applications.pending)} solicitudes · ${number(operation.reconciliation.manual_pending)} conciliaciones`,
        '/solicitudes-distribuidoras',
      ),
      kpi(
        'delinquency',
        'Distribuidoras morosas',
        number(report.delinquency.total),
        'alert-triangle',
        report.delinquency.total ? 'red' : 'green',
        `${money(report.delinquency.overdue_balance)} vencido`,
        '/riesgo',
      ),
      kpi(
        'cutoffs',
        role === 'branch_manager' ? 'Saldo pendiente' : 'Saldo pendiente de relaciones',
        money(report.cutoffs.total_balance),
        'file-text',
        'purple',
        `${number(report.cutoffs.active_count)} cortes con saldo`,
        '/relaciones-pagos/relaciones',
      ),
      kpi(
        'unreconciled',
        'Pagos sin conciliar',
        number(operation.reconciliation.pending),
        'git-merge',
        operation.reconciliation.pending ? 'orange' : 'green',
        `${number(operation.reconciliation.reconciled_today)} conciliados hoy`,
        '/relaciones-pagos/conciliacion',
      ),
      kpi(
        'points',
        'Puntos disponibles',
        number(report.points.available_points),
        'coins',
        'green',
        `${number(report.points.distributors)} distribuidoras`,
        '/puntos',
      ),
      kpi(
        'relations-balance',
        'Relaciones con saldo',
        number(report.cutoffs.active_count),
        'receipt-text',
        report.cutoffs.active_count ? 'purple' : 'green',
        money(report.cutoffs.total_balance),
        '/relaciones-pagos/relaciones',
      ),
    ],
    sections,
  };
}

function applicationTable(items: readonly SolicitudDistribuidoraResponseDto[]): DashboardSection {
  return {
    id: 'assigned-applications',
    kind: 'table',
    category: 'pending',
    title: 'Mis solicitudes asignadas',
    icon: 'clipboard-check',
    route: '/solicitudes-distribuidoras',
    routeLabel: 'Ver todas',
    emptyMessage: 'No hay solicitudes asignadas.',
    span: 'wide',
    columns: [
      { key: 'folio', label: 'Folio' },
      { key: 'applicant', label: 'Solicitante' },
      { key: 'branch', label: 'Sucursal' },
      { key: 'status', label: 'Estado' },
    ],
    rows: items.slice(0, 8).map((item) => ({
      id: item.id,
      cells: {
        folio: item.application_number,
        applicant: item.applicant.full_name || 'Sin dato',
        branch: item.branch.name || 'Sin dato',
        status: '',
      },
      status: {
        key: 'status',
        label: applicationStatus(item.status),
        tone: applicationTone(item.status),
      },
      route: `/verificacion-distribuidoras/solicitudes-distribuidora/${item.id}`,
    })),
  };
}

function applicationSummary(statuses: Record<string, number>, loaded: number): DashboardSection {
  return {
    id: 'application-summary',
    kind: 'summary',
    category: 'summary',
    title: 'Resumen de la carga actual',
    icon: 'chart-no-axes-combined',
    emptyMessage: 'No hay solicitudes para resumir.',
    summary: [
      { id: 'loaded', label: 'Solicitudes cargadas', value: number(loaded) },
      {
        id: 'review',
        label: 'En revisión',
        value: number(statuses['COORDINATOR_REVIEW'] || 0),
        tone: 'orange',
      },
      {
        id: 'verification',
        label: 'En verificación',
        value: number(
          (statuses['VERIFIER_ASSIGNED'] || 0) + (statuses['PHYSICAL_VERIFICATION'] || 0),
        ),
        tone: 'blue',
      },
      {
        id: 'evaluation',
        label: 'En evaluación',
        value: number(statuses['COORDINATOR_EVALUATION'] || 0),
        tone: 'purple',
      },
    ],
  };
}

function visitList(items: readonly VisitaVerificacionResponseDto[]): DashboardSection {
  return {
    id: 'assigned-visits',
    kind: 'list',
    category: 'pending',
    title: 'Visitas asignadas',
    icon: 'map-pin',
    route: '/verificacion-distribuidoras/verificaciones/asignadas',
    routeLabel: 'Ver todas',
    emptyMessage: 'No hay visitas asignadas.',
    span: 'wide',
    items: items.slice(0, 8).map((item) => ({
      id: item.id,
      title:
        item.application?.applicant?.full_name ||
        item.application?.application_number ||
        'Solicitud asignada',
      subtitle: `${item.application?.branch?.name || 'Sin dato'} · ${item.application?.application_number || 'Sin folio'}`,
      meta: dateTime(item.assigned_at),
      icon: 'map-pin',
      tone: visitTone(item.status),
      status: visitStatus(item.status),
      route: `/verificacion-distribuidoras/verificaciones/${item.id}/visita`,
    })),
  };
}

function visitSummary(
  statuses: Record<string, number>,
  loaded: number,
  differences: number,
): DashboardSection {
  return {
    id: 'visit-summary',
    kind: 'summary',
    category: 'summary',
    title: 'Estado de las visitas visibles',
    icon: 'clipboard-check',
    emptyMessage: 'No hay visitas para resumir.',
    summary: [
      { id: 'loaded', label: 'Visitas cargadas', value: number(loaded) },
      {
        id: 'assigned',
        label: 'Asignadas',
        value: number(statuses['ASSIGNED'] || 0),
        tone: 'orange',
      },
      {
        id: 'progress',
        label: 'En curso',
        value: number(statuses['IN_PROGRESS'] || 0),
        tone: 'blue',
      },
      {
        id: 'differences',
        label: 'Con diferencias',
        value: number(differences),
        tone: differences ? 'red' : 'green',
      },
    ],
  };
}

function kpi(
  id: string,
  label: string,
  value: string,
  icon: string,
  tone: DashboardTone,
  secondary?: string,
  route?: string,
) {
  return { id, label, value, icon, tone, secondary, route };
}
function number(value: number): string {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
}
function money(value: string | number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
function date(value: string | null | undefined): string {
  if (!value) return 'Sin dato';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
function dateTime(value: string | null | undefined): string {
  if (!value) return 'Sin dato';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
function time(value: string | null | undefined): string {
  if (!value) return 'Sin dato';
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
function localDateKey(value: string | Date | null | undefined): string {
  if (!value) return '';
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);
}
function timestamp(value: string | null | undefined): number {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}
function month(value: string): string {
  return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(
    new Date(`${value.slice(0, 7)}-02T12:00:00`),
  );
}
function sum(values: readonly (string | number)[]): number {
  return values.reduce<number>((total, value) => total + (Number(value) || 0), 0);
}
function countStatuses(statuses: readonly string[]): Record<string, number> {
  return statuses.reduce<Record<string, number>>(
    (result, status) => ({ ...result, [status]: (result[status] || 0) + 1 }),
    {},
  );
}
function statusLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
function applicationStatus(value: string): string {
  return (
    (
      {
        DRAFT: 'Borrador',
        COORDINATOR_REVIEW: 'En revisión',
        VERIFIER_ASSIGNED: 'Verificador asignado',
        PHYSICAL_VERIFICATION: 'En verificación',
        COORDINATOR_CORRECTION: 'Con correcciones',
        COORDINATOR_EVALUATION: 'En evaluación',
        MANAGER_AUTHORIZATION: 'Por autorizar',
        TERMINATED_UNFAVORABLE: 'No favorable',
        REJECTED: 'Rechazada',
        AUTHORIZED_PENDING_ACTIVATION: 'Autorizada',
        ACTIVE: 'Activa',
      } as Record<string, string>
    )[value] || 'En proceso'
  );
}
function applicationTone(value: string): DashboardTone {
  if (['ACTIVE', 'AUTHORIZED_PENDING_ACTIVATION'].includes(value)) return 'green';
  if (['REJECTED', 'TERMINATED_UNFAVORABLE'].includes(value)) return 'red';
  if (['DRAFT', 'COORDINATOR_REVIEW', 'COORDINATOR_CORRECTION'].includes(value)) return 'orange';
  return value === 'MANAGER_AUTHORIZATION' ? 'purple' : 'blue';
}
function visitStatus(value: string): string {
  return (
    (
      {
        ASSIGNED: 'Asignada',
        IN_PROGRESS: 'En visita',
        COMPLETED: 'Completada',
        CANCELLED: 'Cancelada',
      } as Record<string, string>
    )[value] || statusLabel(value)
  );
}
function visitTone(value: string): DashboardTone {
  if (value === 'COMPLETED') return 'green';
  if (value === 'IN_PROGRESS') return 'blue';
  if (value === 'CANCELLED') return 'red';
  return 'orange';
}
function voucherStatus(value: string): string {
  return (
    (
      {
        GENERATED: 'Generado',
        RELEASED: 'Liberado',
        CASHED: 'Feriado',
        CANCELLED: 'Cancelado',
      } as Record<string, string>
    )[value] || statusLabel(value)
  );
}
function voucherTone(value: string): DashboardTone {
  if (['CASHED', 'RELEASED'].includes(value)) return 'green';
  if (value === 'CANCELLED') return 'red';
  return 'orange';
}
function relationStatus(value: string): string {
  return (
    ({ CURRENT: 'Vigente', OVERDUE: 'Vencida', SETTLED: 'Liquidada' } as Record<string, string>)[
      value
    ] || statusLabel(value)
  );
}
function relationTone(value: string): DashboardTone {
  if (value === 'SETTLED') return 'green';
  if (value === 'OVERDUE') return 'red';
  return 'orange';
}
function reconciliationLabel(value: string): string {
  return value === 'RECONCILED'
    ? 'Conciliado'
    : value === 'PENDING'
      ? 'Pendiente'
      : statusLabel(value);
}
function reconciliationTone(value: string): DashboardTone {
  return value === 'RECONCILED' ? 'green' : value === 'PENDING' ? 'orange' : 'blue';
}
function movementLabel(value: string): string {
  return (
    (
      {
        APPLIED: 'Aplicado',
        PARTIAL: 'Aplicación parcial',
        SURPLUS: 'Excedente',
        UNMATCHED: 'Sin coincidencia',
      } as Record<string, string>
    )[value] || statusLabel(value)
  );
}
