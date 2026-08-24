import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div [ngClass]="getAlertClasses()" class="rounded-xl border p-4 text-sm" role="alert">
        <p>{{ message }}</p>
        @if (actionText) {
          <button type="button" (click)="onAction.emit()" [ngClass]="getActionClasses()" class="mt-2 font-semibold hover:underline">
            {{ actionText }}
          </button>
        }
      </div>
    }
  `
})
export class AlertComponent {
  @Input({ required: true }) message!: string | null;
  @Input() type: AlertType = 'error';
  @Input() actionText?: string;
  @Output() onAction = new EventEmitter<void>();

  getAlertClasses(): string {
    switch (this.type) {
      case 'success': return 'border-green-200 bg-green-50 text-green-700';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'error':
      default: return 'border-red-200 bg-red-50 text-red-700';
    }
  }

  getActionClasses(): string {
    switch (this.type) {
      case 'success': return 'text-green-800';
      case 'warning': return 'text-yellow-900';
      case 'info': return 'text-blue-800';
      case 'error':
      default: return 'text-red-800';
    }
  }
}
