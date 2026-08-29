import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import { SessionStore } from '../../../core/session/session.store';
import { ConfirmationService } from '../../../shared/dialogs/confirmation.service';
import { ReasonActionDialogComponent } from '../../../shared/dialogs/reason-action-dialog/reason-action-dialog.component';
import { AttachmentPreviewComponent } from '../../../shared/components/media/attachment-preview/attachment-preview.component';
import {
  PRIVATE_MEDIA_FILE_RULE,
  validateUploadFile,
} from '../../../shared/utils/files/file-validation';
import {
  StatusBadgeComponent,
  StatusBadgeTone,
} from '../../../shared/components/badges/status-badge/status-badge.component';
import {
  ExcedentesApiService,
  RefundRequest,
  Surplus,
} from '../data-access/excedentes-api.service';
import { groupRefunds, groupSurpluses, RefundGroup, SurplusGroup } from '../data-access/surplus-group';

type ReasonAction = 'AUTHORIZE' | 'REJECT' | 'CANCEL';

@Component({
  selector: 'app-excedentes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReasonActionDialogComponent, StatusBadgeComponent, AttachmentPreviewComponent],
  templateUrl: './excedentes-page.component.html',
})
export class ExcedentesPageComponent implements OnDestroy {
  private readonly api = inject(ExcedentesApiService);
  private readonly media = inject(MediaApiService);
  private readonly session = inject(SessionStore);
  private readonly confirmation = inject(ConfirmationService);

  readonly surpluses = signal<Surplus[]>([]);
  readonly groupedSurpluses = computed(() => groupSurpluses(this.surpluses()));
  readonly refunds = signal<RefundRequest[]>([]);
  readonly groupedRefunds = computed(() => groupRefunds(this.refunds()));
  readonly selected = signal<SurplusGroup | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly reasonTarget = signal<RefundGroup | null>(null);
  readonly reasonAction = signal<ReasonAction | null>(null);
  readonly evidenceFile = signal<File | null>(null);
  readonly executionTarget = signal<RefundGroup | null>(null);
  readonly evidencePreviews = signal<Record<string, { url: string; mime: string }>>({});
  reason = '';
  method = '';
  reference = '';
  observations = '';
  executedAt = this.localDateTime();

  constructor() {
    this.load();
  }

  own(): boolean {
    return this.session.permissions().includes('surpluses.view_own');
  }
  canAuthorize(): boolean {
    return this.session
      .permissions()
      .some((permission) =>
        ['refunds.authorize_branch', 'refunds.authorize_global'].includes(permission),
      );
  }
  canExecute(): boolean {
    return this.session.roles().includes('cashier')
      && this.session.permissions().includes('refunds.execute_branch');
  }
  canManage(): boolean {
    return this.canAuthorize() || this.canExecute();
  }

  floorMoney(value: string | number | null | undefined): number {
    return Math.floor(Number(value ?? 0));
  }

  async credit(item: SurplusGroup): Promise<void> {
    if (
      !(await this.confirmation.confirm({
        title: 'Conservar como saldo a favor',
        message:
          'El importe quedará disponible para aplicarse automáticamente a relaciones futuras.',
        confirmLabel: 'Conservar saldo',
      }))
    )
      return;
    await this.run(
      () => firstValueFrom(this.api.creditMany(item.member_ids)),
      'El excedente quedó disponible como saldo a favor.',
    );
  }

  async requestRefund(item: SurplusGroup): Promise<void> {
    if (
      !(await this.confirmation.confirm({
        title: 'Solicitar devolución',
        message:
          'El importe quedará reservado y no podrá aplicarse a relaciones mientras se revisa la solicitud.',
        confirmLabel: 'Solicitar devolución',
      }))
    )
      return;
    await this.run(
      () => firstValueFrom(this.api.refundMany(item.member_ids)),
      'La devolución quedó pendiente de autorización.',
    );
  }

  open(item: SurplusGroup): void {
    this.selected.set(item);
  }
  close(): void {
    this.selected.set(null);
  }

  openReason(item: RefundRequest | RefundGroup, action: ReasonAction): void {
    this.reasonTarget.set('member_ids' in item ? item : groupRefunds([item])[0]);
    this.reasonAction.set(action);
    this.reason = '';
  }

  closeReason(): void {
    this.reasonTarget.set(null);
    this.reasonAction.set(null);
    this.reason = '';
  }

  async confirmReason(): Promise<void> {
    const item = this.reasonTarget();
    const action = this.reasonAction();
    if (!item || !action || !this.reason.trim()) return;
    const operation = () => Promise.all(item.member_ids.map((id) =>
      action === 'CANCEL'
        ? firstValueFrom(this.api.cancel(id, this.reason.trim()))
        : firstValueFrom(this.api.decide(id, action, this.reason.trim())),
    ));
    const message =
      action === 'AUTHORIZE'
        ? 'La devolución quedó autorizada.'
        : action === 'REJECT'
          ? 'La devolución fue rechazada y el importe volvió a decisión.'
          : 'La solicitud fue cancelada y el importe volvió a decisión.';
    await this.run(operation, message);
    this.closeReason();
  }

  onEvidence(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.evidenceFile.set(null);
      this.error.set('');
      return;
    }
    const validationError = validateUploadFile(file, PRIVATE_MEDIA_FILE_RULE);
    if (validationError) {
      this.evidenceFile.set(null);
      this.error.set(validationError);
      input.value = '';
      return;
    }
    this.evidenceFile.set(file);
  }

  openExecution(item: RefundGroup): void {
    this.resetExecution();
    this.executionTarget.set(item);
  }
  closeExecution(): void {
    this.executionTarget.set(null);
    this.resetExecution();
  }

  async execute(item: RefundGroup): Promise<void> {
    const file = this.evidenceFile();
    const fileError = validateUploadFile(file, PRIVATE_MEDIA_FILE_RULE);
    if (fileError) {
      this.error.set(fileError);
      return;
    }
    if (!this.method.trim() || !this.reference.trim() || !this.executedAt || !file) {
      this.error.set(
        'Captura método, fecha, referencia y comprobante antes de registrar la devolución.',
      );
      return;
    }
    await this.run(async () => {
      return Promise.all(item.members.map(async (refund) => {
        const uploaded = await firstValueFrom(this.media.upload({
          file,
          owner_type: 'surplus_refund_request',
          owner_id: refund.id,
          purpose: 'REFUND_EVIDENCE',
        }));
        return firstValueFrom(this.api.execute(refund.id, {
          amount: refund.amount,
          executed_at: new Date(this.executedAt).toISOString(),
          method: this.method.trim(),
          reference: this.reference.trim(),
          evidence_media_id: uploaded.data.id,
          observations: this.observations.trim() || undefined,
        }));
      }));
    }, 'La devolución externa quedó registrada como devuelta.');
  }

  evidencePreview(mediaId?: string): { url: string; mime: string } | null {
    return mediaId ? this.evidencePreviews()[mediaId] ?? null : null;
  }

  ngOnDestroy(): void {
    Object.values(this.evidencePreviews()).forEach((preview) => URL.revokeObjectURL(preview.url));
  }

  statusLabel(status: string): string {
    return (
      (
        {
          PENDING_DECISION: 'Pendiente de decisión',
          CREDIT_BALANCE: 'Saldo a favor',
          PARTIALLY_APPLIED: 'Aplicado parcialmente',
          CONSUMED: 'Aplicado totalmente',
          REFUND_PENDING: 'Devolución pendiente',
          REFUNDED: 'Devuelto',
          REQUESTED: 'Pendiente de autorización',
          AUTHORIZED: 'Autorizada',
          REJECTED: 'Rechazada',
          CANCELLED: 'Cancelada',
          EXECUTED: 'Devuelta',
        } as Record<string, string>
      )[status] ?? status
    );
  }

  statusTone(status: string): StatusBadgeTone {
    if (['CREDIT_BALANCE', 'CONSUMED', 'REFUNDED', 'EXECUTED'].includes(status)) return 'success';
    if (
      [
        'PENDING_DECISION',
        'REFUND_PENDING',
        'REQUESTED',
        'AUTHORIZED',
        'PARTIALLY_APPLIED',
      ].includes(status)
    )
      return 'warning';
    if (['REJECTED', 'CANCELLED'].includes(status)) return 'danger';
    return 'neutral';
  }

  reasonTitle(): string {
    return this.reasonAction() === 'AUTHORIZE'
      ? 'Autorizar devolución'
      : this.reasonAction() === 'REJECT'
        ? 'Rechazar devolución'
        : 'Cancelar solicitud';
  }

  reasonMessage(): string {
    return this.reasonAction() === 'AUTHORIZE'
      ? 'La cajera podrá registrar la ejecución externa después de esta autorización.'
      : 'El importe reservado regresará a pendiente de decisión sin eliminar este historial.';
  }

  reasonConfirmLabel(): string {
    return this.reasonAction() === 'AUTHORIZE'
      ? 'Autorizar'
      : this.reasonAction() === 'REJECT'
        ? 'Rechazar'
        : 'Cancelar solicitud';
  }

  private async run(operation: () => Promise<unknown>, message: string): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await operation();
      this.success.set(message);
      this.resetExecution();
      this.executionTarget.set(null);
      await this.load();
    } catch (error) {
      this.showError(error, 'No fue posible completar la operación.');
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [surpluses, refunds] = await Promise.all([
        firstValueFrom(this.api.list()),
        this.canManage() ? firstValueFrom(this.api.refunds()) : Promise.resolve([]),
      ]);
      this.surpluses.set(surpluses);
      this.refunds.set(refunds);
      void this.loadEvidencePreviews([
        ...refunds,
        ...surpluses.flatMap((surplus) => surplus.refund_requests ?? []),
      ]);
      const current = this.selected();
      if (current) {
        this.selected.set(groupSurpluses(surpluses).find((item) => item.id === current.id) ?? null);
      }
    } catch (error) {
      this.showError(error, 'No fue posible cargar excedentes y devoluciones.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetExecution(): void {
    this.method = '';
    this.reference = '';
    this.observations = '';
    this.executedAt = this.localDateTime();
    this.evidenceFile.set(null);
  }

  private async loadEvidencePreviews(refunds: RefundRequest[]): Promise<void> {
    const ids = [...new Set(refunds.map((item) => item.evidence_media_id).filter((id): id is string => !!id))];
    await Promise.all(ids.map(async (mediaId) => {
      if (this.evidencePreviews()[mediaId]) return;
      try {
        const blob = await firstValueFrom(this.media.download(mediaId));
        this.evidencePreviews.update((current) => ({
          ...current,
          [mediaId]: { url: URL.createObjectURL(blob), mime: blob.type || 'application/octet-stream' },
        }));
      } catch {
        // El error general de carga no debe ocultar el historial de la devolución.
      }
    }));
  }

  private localDateTime(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  private showError(error: unknown, fallback: string): void {
    const response = error as HttpErrorResponse;
    this.error.set(response?.error?.error?.message ?? fallback);
  }
}
