import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../alert.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  alertService = inject(AlertService);

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'check-circle-2';
      case 'error': return 'octagon-alert';
      case 'warning': return 'alert-triangle';
      case 'info':
      default: return 'info';
    }
  }

  getColorClasses(type: string): string {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'error': return 'bg-red-50 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default: return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info':
      default: return 'text-blue-500';
    }
  }

  title(type: string): string {
    return ({ success: 'Listo', error: 'No se pudo completar', warning: 'Revisa antes de continuar', info: 'Información' } as Record<string, string>)[type] ?? 'Información';
  }
}
