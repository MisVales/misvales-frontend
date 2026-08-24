import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RelationDetail } from './riesgo-api.service';

@Component({
  selector: 'app-relation-details-dialog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    @if (open) {
      <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <section class="dialog">
          <header class="dialog-header">
            <h2 id="dialog-title">Detalle de Relaciones Vencidas</h2>
            <button type="button" class="close-btn" (click)="close.emit()" aria-label="Cerrar">&times;</button>
          </header>
          
          <div class="dialog-content">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b text-sm text-gray-500">
                  <th class="py-2 font-semibold">Folio</th>
                  <th class="py-2 font-semibold">Fecha de Corte</th>
                  <th class="py-2 font-semibold">Fecha Límite</th>
                  <th class="py-2 font-semibold">Total a Pagar</th>
                  <th class="py-2 font-semibold">Saldo Pendiente</th>
                  <th class="py-2 font-semibold">Estatus</th>
                  <th class="py-2 font-semibold">Liquidado el</th>
                </tr>
              </thead>
              <tbody>
                @for (detail of relations; track detail.id) {
                  <tr class="border-b text-sm">
                    <td class="py-3 font-medium">{{ detail.payment_reference }}</td>
                    <td class="py-3">{{ detail.cutoff_at | date: 'dd/MM/yyyy' }}</td>
                    <td class="py-3 text-red-600 font-medium">{{ detail.payment_deadline_at | date: 'dd/MM/yyyy' }}</td>
                    <td class="py-3">{{ detail.misvales_total | currency: 'MXN' }}</td>
                    <td class="py-3 font-bold">{{ detail.balance | currency: 'MXN' }}</td>
                    <td class="py-3">
                      <span class="px-2 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-100 text-green-800': detail.financial_status === 'SETTLED',
                          'bg-yellow-100 text-yellow-800': detail.financial_status === 'PARTIALLY_PAID',
                          'bg-red-100 text-red-800': detail.financial_status === 'PENDING'
                        }">
                        {{ detail.financial_status }}
                      </span>
                    </td>
                    <td class="py-3">{{ (detail.settled_at | date: 'dd/MM/yyyy') || '---' }}</td>
                  </tr>
                }
                @if (!relations || relations.length === 0) {
                  <tr>
                    <td colspan="7" class="py-4 text-center text-gray-500">No hay detalles disponibles</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <footer class="dialog-footer">
            <button type="button" class="close-action-btn" (click)="close.emit()">Cerrar</button>
          </footer>
        </section>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; z-index: 60; inset: 0; display: grid; place-items: center; background: rgb(17 24 39 / 52%); padding: 1rem; backdrop-filter: blur(4px); }
    .dialog { width: min(100%, 64rem); max-height: 90vh; display: flex; flex-direction: column; border: 1px solid var(--mv-border); border-radius: var(--mv-radius-lg); background: var(--mv-surface); overflow: hidden; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--mv-border); }
    h2 { margin: 0; color: var(--mv-text); font-size: 1.125rem; font-weight: 750; }
    .close-btn { background: none; border: none; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--mv-text-muted); }
    .close-btn:hover { color: var(--mv-text); }
    .dialog-content { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .dialog-footer { padding: 1.25rem 1.5rem; border-top: 1px solid var(--mv-border); display: flex; justify-content: flex-end; }
    .close-action-btn { min-height: 2.625rem; border-radius: var(--mv-radius-sm); padding: .625rem 1.5rem; font-weight: 700; cursor: pointer; border: 1px solid var(--mv-border-strong); background: var(--mv-surface); color: var(--mv-text); }
    .close-action-btn:hover { background: var(--mv-surface-muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationDetailsDialogComponent {
  @Input() open = false;
  @Input() relations: RelationDetail[] = [];
  @Output() readonly close = new EventEmitter<void>();
}
